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
  const { data: bookings, error } = useSWR<Booking[]>('/api/bookings', fetcher);

  if (error) {
    throw new Error(error);
  }

  return (
    <VStack spacing={1} align="stretch">
      <Select>
        <option value="1">{format(startOfDay(new Date()), 'LLL d, y')}</option>
      </Select>
      <Center>
        {!bookings ? (
          <CircularProgress />
        ) : (
          <Container p="2">
            <VStack align="stretch">
              {bookings.map((booking) => (
                <Box
                  key={booking.id}
                  h="full"
                  p="2"
                  border="1px"
                  borderRadius="md"
                >
                  <VStack>
                    <Text>{`${booking.firstName} ${booking.lastName}`}</Text>
                    <Text>{booking.startsAt}</Text>
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
        )}
      </Center>
    </VStack>
  );
};

export default IndexPage;
