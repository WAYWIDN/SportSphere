# Booking Module

## Purpose

The booking module stores confirmed reservations and serves the player's booking history.

## Main Flow

- A coach booking record is created when a coach accepts a session request.
- A venue booking record is created when a venue owner accepts a venue request, or when a game is booked.
- My Bookings loads the player's pending, approved, and rejected requests.

## Endpoints

- `GET /v1/user/bookings?type=coach`
- `GET /v1/user/bookings?type=venue`
  - `type` is `coach` or `venue`.
  - Returns pending, approved, and rejected requests for the signed-in player.
  - Pagination uses `lastRequestId`.

## Rules

- Only a player can read this history.
- Coach rows include the coach name and slot.
- Venue rows include the venue, court, and slot.
- Booking times use epoch milliseconds.
