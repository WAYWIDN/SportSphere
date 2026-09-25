# Coach Module

## Purpose

The coach module manages coach profiles, coach availability slots, and player requests for coach slots.

## Main Flow

1. A coach creates a profile.
2. The coach creates available time slots.
3. A player requests an available slot.
4. The coach accepts or rejects the request.
5. Accepting the request books the slot and creates a booking.
6. Rejecting the request leaves the slot available.

## Endpoints

### Profile

- `POST /v1/coach/profile`
- `PATCH /v1/coach/profile`
- `POST /v1/coaches/search`
  - Searches coaches. Body fields (all optional): `sport`, `city`, `state`, `minExperience`, `maxExperience`, `lastCoachId`.
- `GET /v1/coaches/:coachId`

### Slots

- `POST /v1/coach/slots`
- `GET /v1/coach/slots`
- `DELETE /v1/coach/slots/:slotId`
- `GET /v1/coaches/:coachId/slots`
- `GET /v1/coaches/:coachId/slots/events`

### Session Requests

- `POST /v1/slots/:slotId/requests`
- `GET /v1/user/session-requests`
- `GET /v1/coach/session-requests`
- `PATCH /v1/coach/session-requests/:requestId`

## Rules

- Only coaches can manage their own profile and slots.
- Only players can request a coach slot.
- Slots use epoch milliseconds.
- Slots must be at least 30 minutes long.
- Overlapping slots for the same coach and date are rejected.
- A coach slot is cancelled rather than updated or physically deleted.
- Slot changes are sent to connected SSE clients.
- Accept and reject actions create booking notifications.
