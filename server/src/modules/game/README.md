# Game Module

## Purpose

The game module lets players create public games for venue slots and invite other platform players through join requests.

## Main Flow

1. A player creates a game for a subvenue slot.
2. The creator is automatically added to `acceptedPlayerIds`.
3. Other players find the game and send join requests.
4. The creator accepts or rejects requests.
5. Accepted users are stored directly in `acceptedPlayerIds`.
6. When the minimum player count is reached, the game becomes `ready`.
7. The creator books the game.
8. The slot is atomically changed from `available` to `booked`.

## Endpoints

- `POST /v1/games/search`
  - Searches active games. Body fields (all optional):
    `subvenueId`, `sport`, `date`, `status` (`forming` | `ready`), `minPlayers`, `maxPlayers`, `lastGameId`.
- `GET /v1/games/:gameId`
  - Public game details.
- `GET /v1/games/:gameId/stream`
  - Streams real-time SSE updates for a game (requires player role).
- `POST /v1/games`
  - Creates a game.
- `POST /v1/games/:gameId/join-request`
  - Sends a join request.
- `GET /v1/games/:gameId/join-requests`
  - Lets the creator view requests.
- `PATCH /v1/games/:gameId/join-requests/:requestId`
  - Accepts or rejects a request.
- `POST /v1/games/:gameId/book`
  - Books the slot when the game is ready.
- `POST /v1/games/:gameId/cancel`
  - Cancels the game.

## Rules

- Only players can create, join, manage, book, or cancel games.
- Multiple games may compete for the same slot.
- Creating a game does not reserve the slot.
- Only the final atomic booking reserves the slot.
- A game can accept requests only while it is forming.
- Accepted players cannot exceed the maximum player count.
- Join requests are stored separately for pending and rejected history.
- Game and booking notifications are sent through BullMQ.
- Slot times use epoch milliseconds.
