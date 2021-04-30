/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import urljoin from 'url-join';
import { format, getDayOfYear } from 'date-fns';
import {
  AnswerCode,
  AnswerKey,
  answerKeyToCode,
  Booking,
  YCMBBookingDto,
} from '../../../interfaces/YCBMBookingDto';

const accountId = process.env.YCMB_ACCOUNT_ID;
const profileId = process.env.YCMB_PROFILE_ID;
const username = process.env.YCMB_USER;
const apiKey = process.env.YCMB_API_KEY;

if (!accountId || !profileId || !username || !apiKey) {
  throw new Error('Missing required YCMB account keys');
}

function ycmbBookingToBooking(ycmbBooking: YCMBBookingDto): Booking {
  const answers: ReadonlyMap<AnswerCode, AnswerKey> = new Map(
    ycmbBooking.answers.map(({ code, string }) => [
      code as AnswerCode,
      string as AnswerKey,
    ]),
  );

  return {
    id: ycmbBooking.id,
    createdAt: new Date(ycmbBooking.createdAt),
    startsAt: new Date(ycmbBooking.startsAt),
    endsAt: new Date(ycmbBooking.endsAt),
    cancelled: ycmbBooking.cancelled,
    title: ycmbBooking.title,
    email: answers.get(answerKeyToCode.email)!,
    phone: answers.get(answerKeyToCode.phone)!,
    lastName: answers.get(answerKeyToCode.lastName)!,
    firstName: answers.get(answerKeyToCode.firstName)!,
    todo: answers.get(answerKeyToCode.todo)!,
    duration: ycmbBooking.displayDurationFull,
  };
}

const baseUrl = 'https://api.youcanbook.me/v1/';
const bookingsUrl = urljoin(
  baseUrl,
  accountId,
  'profiles',
  profileId,
  'bookings',
);

const ycbmAxios = axios.create({
  auth: {
    username,
    password: apiKey,
  },
});

export default async function handler(
  { query: { date } }: NextApiRequest & { query: { date: string } },
  res: NextApiResponse,
) {
  const { data: bookings } = await ycbmAxios.get<YCMBBookingDto[]>(
    bookingsUrl,
    {
      params: {
        jumpToDate: format(new Date(date), 'yyyy-LL-dd'),
        fields:
          'startsAt,endsAt,createdAt,displayDurationShort,displayDurationFull,answers,answers.code,answers.string' +
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
