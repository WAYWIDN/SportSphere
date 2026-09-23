import { Response } from 'express';

const slotClients = new Map<string, Set<Response>>();

const getStreamKey = (subvenueId: string, date: string) =>
  `${subvenueId}:${date}`;

export const addSlotClient = (
  subvenueId: string,
  date: string,
  response: Response,
) => {
  const streamKey = getStreamKey(subvenueId, date);
  const clients = slotClients.get(streamKey) ?? new Set<Response>();
  clients.add(response);
  slotClients.set(streamKey, clients);

  return () => {
    clients.delete(response);
    if (clients.size === 0) {
      slotClients.delete(streamKey);
    }
  };
};

export const sendSlotEvent = (
  subvenueId: string,
  date: string,
  slotId: string,
  event: string,
  data: Record<string, unknown>,
) => {
  const clients = slotClients.get(getStreamKey(subvenueId, date));
  if (!clients) {
    return;
  }

  const message = `event: ${event}\ndata: ${JSON.stringify({
    slotId,
    date,
    ...data,
  })}\n\n`;
  for (const client of clients) {
    client.write(message);
  }
};
