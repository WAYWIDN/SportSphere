# Booking Module

## Purpose

The booking module stores confirmed and cancelled reservations for coach slots and venue slots.

## Main Flow

- A coach booking is created when a coach accepts a session request.
- A venue booking is created when a game creator books a ready game.
- A direct venue booking is created when a venue owner accepts a venue booking request.
- A player can view their bookings.
- A player can cancel a confirmed booking.
- Cancelling a booking makes the related slot available again.

## Endpoints

- `GET /v1/user/bookings`
  - Returns the current user's bookings with pagination.
- `GET /v1/bookings/:bookingId`
  - Returns one booking belonging to the current user.
- `PATCH /v1/bookings/:bookingId/cancel`
  - Cancels a confirmed booking.

## Rules

- A user can only view or cancel their own bookings.
- A slot is booked only through an atomic database update from `available` to `booked`.
- Booking times use epoch milliseconds.
- `sourceRequestId` identifies coach bookings.
- `sourceGameId` identifies game bookings.
- `sourceVenueRequestId` identifies direct venue booking requests.
- Booking email notifications are sent through BullMQ.
