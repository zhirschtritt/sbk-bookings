import { VStack, Box, Text } from '@chakra-ui/react';
import { format } from 'date-fns';
import React from 'react';
import { Booking } from '../interfaces/YCBMBookingDto';

export function BookingsList({ bookings }: { bookings: Booking[] }) {
  return (
    <VStack align="stretch">
      {bookings.map((booking) => (
        <Box key={booking.id} h="full" p="2" border="1px" borderRadius="md">
          <VStack>
            <Text>
              {booking.firstName} {booking.lastName} ({booking.email})
            </Text>
            <Text>
              {format(new Date(booking.startsAt), 'hh:mm aa')} -{' '}
              {booking.duration}
            </Text>
          </VStack>
        </Box>
      ))}
    </VStack>
  );
}
