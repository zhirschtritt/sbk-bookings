interface BookingCommonData {
  id: string;
  title: string;
  cancelled: boolean;
}

export interface YCMBBookingDto extends BookingCommonData {
  createdAt: string;
  startsAt: string;
  endsAt: string;
  answers: {
    code: string;
    string: string;
  }[];
  displayDurationFull: `${number} ${'minutes' | 'hours'}`;
}

export interface Booking extends BookingCommonData {
  createdAt: Date;
  startsAt: Date;
  endsAt: Date;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  todo: string;
  duration: string;
}

export type AnswerCode = 'FNAME' | 'LNAME' | 'EMAIL' | 'Q7' | 'Q5';
export type AnswerKey = keyof Pick<
  Booking,
  'firstName' | 'lastName' | 'email' | 'phone' | 'todo'
>;

export const answerKeyToCode: Record<AnswerKey, AnswerCode> = {
  firstName: 'FNAME',
  lastName: 'LNAME',
  email: 'EMAIL',
  phone: 'Q7',
  todo: 'Q5',
} as const;
