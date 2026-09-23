import { Response } from 'express';

const gameClients = new Map<string, Set<Response>>();

const getStreamKey = (gameId: string) => gameId;

export const addGameClient = (gameId: string, response: Response) => {
  const streamKey = getStreamKey(gameId);
  const clients = gameClients.get(streamKey) ?? new Set<Response>();
  clients.add(response);
  gameClients.set(streamKey, clients);

  return () => {
    clients.delete(response);
    if (clients.size === 0) {
      gameClients.delete(streamKey);
    }
  };
};

export const sendGameEvent = (
  gameId: string,
  event: string,
  data: Record<string, unknown>,
) => {
  const clients = gameClients.get(getStreamKey(gameId));
  if (!clients) {
    return;
  }

  const message = `event: ${event}\ndata: ${JSON.stringify({
    gameId,
    ...data,
  })}\n\n`;

  for (const client of clients) {
    client.write(message);
  }
};
