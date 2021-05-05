import {
  Center,
  Text,
  Container,
  Select,
  VStack,
  useControllableState,
  Skeleton,
  Progress,
} from '@chakra-ui/react';
import axios from 'axios';
import {
  startOfDay,
  format,
  add,
  eachWeekOfInterval,
  isThursday,
  nextThursday,
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
    defaultValue: ((isThursday(now) && now) || nextThursday(now)).toISOString(),
  });

  const { data, error } = useSWR<{
    bookings: Booking[];
    cancelled: Booking[];
  }>(`/api/bookings/?date=${selectedDate}`, fetcher);

  if (error) {
    throw new Error(error);
  }

  return (
    <VStack spacing={1} align="stretch" paddingX="1">
      <Center>
        <Select
          variant="flushed"
          paddingTop="1"
          value={selectedDate}
          onChange={(props) => setDate(props.target.value)}
          maxW="container.md"
        >
          {allThursdays.map((date) => (
            <option key={date.getTime()} value={date.toISOString()}>
              {format(startOfDay(date), 'EEEE - LLL d, y')}
            </option>
          ))}
        </Select>
      </Center>
      {!data ? (
        <Progress size="md" isIndeterminate margin="5" />
      ) : (
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
      )}
    </VStack>
  );
};

export default IndexPage;
