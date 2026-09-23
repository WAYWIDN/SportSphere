import { BookingNotificationStatus } from './bookingNotificationQueue';

export const getBookingNotificationTemplate = (
  status: BookingNotificationStatus,
  startEpoch: number,
  endEpoch: number,
): string => {
  let title = 'Booking cancelled';
  let message = 'Your booking has been cancelled.';

  if (status === 'confirmed') {
    title = 'Booking confirmed';
    message = 'Your booking has been accepted.';
  } else if (status === 'rejected') {
    title = 'Booking request rejected';
    message = 'Your booking request has been rejected.';
  }

  const toDate = (epoch: number) => new Date(epoch);

  const start = toDate(startEpoch).toLocaleString();
  const end = toDate(endEpoch).toLocaleString();

  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #222;">
    <h1 style="color: #ff8c00;">SportSphere</h1>
    <h2>${title}</h2>
    <p>${message}</p>
    <p><strong>Booking time:</strong> ${start} - ${end}</p>
  </div>`;
};
