/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import urljoin from 'url-join';
import { format, getDayOfYear } from 'date-fns';
import {
  AnswerCode,
  AnswerKey,
  answerCodeToKey,
  Booking,
  YCMBBookingDto,
} from '../../../interfaces/Bookings';

const accountId = process.env.YCMB_ACCOUNT_ID;
const profileId = process.env.YCMB_PROFILE_ID;
const username = process.env.YCMB_USER;
const apiKey = process.env.YCMB_API_KEY;

if (!accountId || !profileId || !username || !apiKey) {
  throw new Error('Missing required YCMB account key(s)');
}

function ycmbBookingToBooking(ycbmBooking: YCMBBookingDto): Booking {
  const answers: ReadonlyMap<AnswerKey, string> = new Map(
    ycbmBooking.answers.map(({ code, string }) => [
      answerCodeToKey[code as AnswerCode],
      string,
    ]),
  );

  return {
    id: ycbmBooking.id,
    createdAt: new Date(ycbmBooking.createdAt),
    startsAt: new Date(ycbmBooking.startsAt),
    endsAt: new Date(ycbmBooking.endsAt),
    cancelled: ycbmBooking.cancelled,
    title: ycbmBooking.title,
    email: answers.get('email')!,
    phone: answers.get('phone')!,
    lastName: answers.get('lastName')!,
    firstName: answers.get('firstName')!,
    todo: answers.get('todo')!,
    duration: ycbmBooking.displayDurationFull,
  };
}

const axiosInstance = axios.create({
  baseURL: urljoin(
    'https://api.youcanbook.me/v1/',
    accountId,
    'profiles',
    profileId,
  ),
  auth: {
    username,
    password: apiKey,
  },
});

export default async function handler(
  { query: { date } }: NextApiRequest & { query: { date: string } },
  res: NextApiResponse,
) {
  const { data: bookings } = await axiosInstance.get<YCMBBookingDto[]>(
    '/bookings',
    {
      params: {
        jumpToDate: format(new Date(date), 'yyyy-LL-dd'),
        fields:
          'id,startsAt,endsAt,createdAt,displayDurationShort,displayDurationFull,answers,answers.code,answers.string' +
          ',cancelled,id,title',
      },
    },
  );

  // filter by date in req
  const bookingsForDate = bookings
    .map(ycmbBookingToBooking)
    .filter((b) => getDayOfYear(b.startsAt) === getDayOfYear(new Date(date)));

  res.status(200);
  res.json({
    bookings: bookingsForDate.filter((b) => !b.cancelled),
    cancelled: bookingsForDate.filter((b) => b.cancelled),
  });
}
