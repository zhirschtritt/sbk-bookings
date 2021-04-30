import {
  Box,
  Center,
  CircularProgress,
  Text,
  Container,
  Select,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import { startOfDay, format } from 'date-fns';
import React from 'react';

import useSWR from 'swr';
import { Booking } from '../interfaces/YCBMBookingDto';

const fetcher = async (url: string) => {
  const res = await axios.get(url);
  return res.data;
};

const IndexPage = () => {
  const { data, error } = useSWR<{
    bookings: Booking[];
    cancelled: Booking[];
  }>('/api/bookings', fetcher);

  if (error) {
    throw new Error(error);
  }

  return (
    <VStack spacing={1} align="stretch">
      <Select>
        <option value="1">
          {format(startOfDay(new Date()), 'EEEE - LLL d, y')}
        </option>
      </Select>
      <Center>
        {!data?.bookings ? (
          <CircularProgress />
        ) : (
          <VStack align="stretch" width="full" padding="5px">
            <Container p="2" border="1px" borderRadius="md">
              <VStack align="stretch">
                <Text fontSize="lg" color="green.500">
                  Booked
                </Text>
                {data.bookings.map((booking) => (
                  <Box
                    key={booking.id}
                    h="full"
                    p="2"
                    border="1px"
                    borderRadius="md"
                  >
                    <VStack>
                      <Text>{`${booking.firstName} ${booking.lastName}`}</Text>
                      <Text>
                        {format(new Date(booking.startsAt), 'hh:mm aa')}
                      </Text>
                      <Text>{booking.duration}</Text>
                      <Text>{booking.email}</Text>
                      <Text>
                        Cancelled: {booking.cancelled ? 'true' : 'false'}
                      </Text>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Container>
            <Container p="2" border="1px" borderRadius="md">
              <VStack align="stretch">
                <Text fontSize="lg" color="red.500">
                  Cancelled
                </Text>
                {data.cancelled.map((booking) => (
                  <Box
                    key={booking.id}
                    h="full"
                    p="2"
                    border="1px"
                    borderRadius="md"
                  >
                    <VStack>
                      <Text>{`${booking.firstName} ${booking.lastName}`}</Text>
                      <Text>
                        {format(new Date(booking.startsAt), 'hh:mm aa')}
                      </Text>
                      <Text>{booking.duration}</Text>
                      <Text>{booking.email}</Text>
                      <Text>
                        Cancelled: {booking.cancelled ? 'true' : 'false'}
                      </Text>
                    </VStack>
                  </Box>
                ))}
              </VStack>
            </Container>
          </VStack>
        )}
      </Center>
    </VStack>
  );
};

export default IndexPage;
