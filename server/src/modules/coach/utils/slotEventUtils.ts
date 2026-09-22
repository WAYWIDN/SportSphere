import { Response } from 'express';

const slotClients = new Map<string, Set<Response>>();
const getStreamKey = (coachId: string, date: string) => `${coachId}:${date}`;

export const addSlotClient = (
  coachId: string,
  date: string,
  response: Response,
) => {
  const streamKey = getStreamKey(coachId, date);
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
  coachId: string,
  date: string,
  slotId: string,
  event: string,
  data: Record<string, unknown>,
) => {
  const clients = slotClients.get(getStreamKey(coachId, date));
  if (!clients) {
    return;
  }

  const message = `event: ${event}\ndata: ${JSON.stringify({
    slotId,
    ...data,
  })}\n\n`;
  for (const client of clients) {
    client.write(message);
  }
};
