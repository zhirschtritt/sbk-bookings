import {
  Center,
  Container,
  Select,
  Skeleton,
  Text,
  useControllableState,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import {
  add,
  eachWeekOfInterval,
  format,
  isThursday,
  nextThursday,
  startOfDay,
} from 'date-fns';
import React from 'react';
import useSWR from 'swr';

import { BookingsList } from '../components/BookingsList';
import { Booking } from '../interfaces/YCBMBookingDto';

const fetcher = async (url: string) => {
  const res = await axios.get(url);
  return res.data;
};

const IndexPage = () => {
  const now = startOfDay(new Date());

  const allThursdays = eachWeekOfInterval(
    {
      start: now,
      end: add(now, { weeks: 4 }),
    },
    { weekStartsOn: 4 },
  );

  const [selectedDate, setDate] = useControllableState({
    defaultValue: (isThursday(now) ? now : nextThursday(now)).toISOString(),
  });

  const { data, error } = useSWR<{
    bookings: Booking[];
    cancelled: Booking[];
  }>(`/api/bookings/?date=${selectedDate}`, fetcher);

  if (error) {
    throw new Error(error);
  }

  return (
    <VStack spacing={1} align="stretch">
      <Select value={selectedDate} onChange={(e) => setDate(e.target.value)}>
        {allThursdays.map((date) => (
          <option key={date.getTime()} value={date.toISOString()}>
            {format(startOfDay(date), 'EEEE - LLL d, y')}
          </option>
        ))}
      </Select>
      <VStack align="stretch" width="full" padding="5px">
        <Skeleton isLoaded={!!data}>
          <Center>
            <Container p="2" border="1px" borderRadius="md">
              <Text fontSize="lg" color="green.500">
                Booked
              </Text>
              <BookingsList bookings={data?.bookings || []} />
            </Container>
          </Center>
        </Skeleton>
        <Skeleton isLoaded={!!data}>
          <Center>
            <Container p="2" border="1px" borderRadius="md">
              <Text fontSize="lg" color="red.500">
                Cancelled
              </Text>
              <BookingsList bookings={data?.cancelled || []} />
            </Container>
          </Center>
        </Skeleton>
      </VStack>
    </VStack>
  );
};

export default IndexPage;
