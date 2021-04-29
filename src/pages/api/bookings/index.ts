/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import urljoin from 'url-join';
import { isToday } from 'date-fns';
import {
  AnswerCode,
  AnswerKey,
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
    email: answers.get('EMAIL')!,
    phone: answers.get('Q7')!,
    lastName: answers.get('LNAME')!,
    firstName: answers.get('FNAME')!,
    todo: answers.get('Q5')!,
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
  params: {
    fields:
      'startsAt,endsAt,createdAt,displayDurationShort,displayDurationFull,answers,answers.code,answers.string' +
      ',cancelled,id,title',
  },
  auth: {
    username,
    password: apiKey,
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { data: bookings } = await ycbmAxios.get<YCMBBookingDto[]>(bookingsUrl);

  // filter by date in req

  res.status(200);
  res.json(
    bookings
      .map(ycmbBookingToBooking)
      .filter((b) => isToday(b.startsAt) && !b.cancelled),
  );
}

// type enforcement
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handlerCheck: NextApiHandler<Booking[]> = handler;
