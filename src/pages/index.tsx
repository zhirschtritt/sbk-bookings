import {
  Center,
  Container,
  Select,
  useControllableState,
  VStack,
  Text,
  Skeleton,
} from '@chakra-ui/react';
import axios from 'axios';
import {
  add,
  eachWeekOfInterval,
  format,
  isThursday,
  nextThursday,
  startOfDay,
  sub,
} from 'date-fns';
import React, { useState, useEffect } from 'react';
import useSWR from 'swr';

import { BookingsList } from '../components/BookingsList';
import { Booking } from '../interfaces/Bookings';

interface BookedAndCancelledRes {
  bookings: Booking[];
  cancelled: Booking[];
}

const fetcher = async (url: string): Promise<BookedAndCancelledRes> => {
  const res = await axios.get<BookedAndCancelledRes>(url);
  return res.data;
};

const IndexPage = () => {
  const [now, setNow] = useState(startOfDay(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(startOfDay(new Date()));
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const defaultDate = isThursday(now) ? now : nextThursday(now);

  const allThursdays = eachWeekOfInterval(
    {
      start: sub(defaultDate, { weeks: 1 }),
      end: add(defaultDate, { weeks: 3 }),
    },
    { weekStartsOn: 4 },
  );

  const [selectedDate, setDate] = useControllableState({
    defaultValue: defaultDate.toISOString(),
  });

  const { data, error } = useSWR<BookedAndCancelledRes>(
    `/api/bookings/?date=${selectedDate}`,
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // 5 minutes
    },
  );

  if (error) {
    throw new Error(error);
  }

  return (
    <VStack spacing={1} align="stretch" paddingX="1">
      <Center>
        <Select
          variant="flushed"
          paddingTop="1"
          defaultValue={defaultDate.toISOString()}
          onChange={(e) => setDate(e.target.value)}
          maxW="container.md"
        >
          {allThursdays.map((date) => (
            <option key={date.toISOString()} value={date.toISOString()}>
              {format(startOfDay(date), 'EEEE - LLL d, y')}
            </option>
          ))}
        </Select>
      </Center>

      <Skeleton isLoaded={!!data} startColor="green.500">
        <VStack align="stretch" width="full">
          <Center>
            <Container p="2" maxW="container.md">
              <Text fontSize="lg" color="green.500">
                Booked
              </Text>
              <BookingsList bookings={data?.bookings || []} color="green.500" />
            </Container>
          </Center>
          <Center>
            {data?.cancelled.length ? (
              <Container p="2" maxW="container.md">
                <Text fontSize="lg" color="red.500">
                  Cancelled
                </Text>
                <BookingsList
                  bookings={data?.cancelled || []}
                  color="red.500"
                />
              </Container>
            ) : (
              <></>
            )}
          </Center>
        </VStack>
      </Skeleton>
    </VStack>
  );
};

export default IndexPage;
