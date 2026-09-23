import { BookingNotificationStatus } from './bookingNotificationQueue';

export const getBookingNotificationTemplate = (
  status: BookingNotificationStatus,
  startEpoch: number,
  endEpoch: number,
): string => {
  const title =
    status === 'confirmed' ? 'Booking confirmed' : 'Booking cancelled';
  const message =
    status === 'confirmed'
      ? 'Your booking has been accepted.'
      : 'Your booking has been cancelled.';
  const start = new Date(startEpoch).toLocaleString();
  const end = new Date(endEpoch).toLocaleString();

  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #222;">
    <h1 style="color: #ff8c00;">SportSphere</h1>
    <h2>${title}</h2>
    <p>${message}</p>
    <p><strong>Booking time:</strong> ${start} - ${end}</p>
  </div>`;
};
