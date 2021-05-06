import { VStack, Box, Text, ColorProps } from '@chakra-ui/react';
import { format } from 'date-fns';
import React from 'react';
import { Booking } from '../interfaces/Bookings';

export function BookingsList({
  bookings,
  color,
}: {
  bookings: Booking[];
  color: ColorProps['color'];
}) {
  return (
    <VStack align="stretch">
      {bookings.map((booking) => (
        <Box
          key={booking.id}
          h="full"
          p="2"
          border="1px"
          borderRadius="sm"
          borderColor={color}
        >
          <VStack>
            <Text>
              {booking.firstName} {booking.lastName} ({booking.email})
            </Text>
            <Text>
              {format(new Date(booking.startsAt), 'h:mm aa')} -{' '}
              {booking.duration}
            </Text>
            <Text color="gray.500" fontSize="sm">
              {booking.todo}
            </Text>
          </VStack>
        </Box>
      ))}
    </VStack>
  );
}
