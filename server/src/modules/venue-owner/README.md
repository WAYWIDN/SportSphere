# Venue Owner Module

## Purpose

The venue-owner module lets a venue owner manage venues, subvenues, and booking slots.

## Relationship

```text
Venue owner
  -> Venue
      -> Subvenue
          -> Slots
```

## Main Flow

1. A venue owner creates a venue.
2. The owner adds playable subvenues inside it.
3. The owner creates slots for each subvenue and date.
4. A player sends a booking request for a slot.
5. The owner accepts or rejects the request.
6. An accepted request creates a booking and marks the slot as booked.
7. Players view slots and can receive real-time SSE updates.
8. A slot can be deleted, but it cannot be updated through this module.

## Endpoints

### Venues

- `POST /v1/venues`
- `GET /v1/venues`
- `GET /v1/venues/:venueId`
- `PATCH /v1/venues/:venueId`
- `DELETE /v1/venues/:venueId`

### Subvenues

- `POST /v1/venues/:venueId/subvenues`
- `GET /v1/venues/:venueId/subvenues`
- `GET /v1/subvenues/:subvenueId`
- `PATCH /v1/subvenues/:subvenueId`
- `DELETE /v1/subvenues/:subvenueId`

### Slots

- `POST /v1/subvenues/:subvenueId/slots`
- `GET /v1/subvenues/:subvenueId/slots?date=YYYY-MM-DD`
- `GET /v1/subvenues/:subvenueId/slots/stream?date=YYYY-MM-DD`
- `DELETE /v1/slots/:slotId`

### Booking Requests

- `POST /v1/subvenues/:subvenueId/slots/:slotId/booking-requests`
- `GET /v1/venue-owner/booking-requests`
- `PATCH /v1/venue-owner/booking-requests/:requestId`

## Rules

- Venue-owner mutations require the `venue-owner` role.
- Subvenue ownership is checked through its parent venue.
- Images are stored as URL values, not uploaded files.
- Slot times use epoch milliseconds.
- Slots must be at least 30 minutes long.
- Slots on the same subvenue and date cannot overlap.
- The end of one slot may equal the start of another slot.
- Slot updates are not supported; delete and create a new slot instead.
- Multiple players can request the same available slot.
- Only one accepted request can book a slot because booking changes the slot atomically from `available` to `booked`.
- SSE updates are grouped by subvenue and date.
