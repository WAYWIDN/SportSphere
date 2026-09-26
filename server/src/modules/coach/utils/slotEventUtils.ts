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

  console.log('SSE CLIENT CONNECTED', {
    streamKey,
    clients: clients.size,
  });

  return () => {
    clients.delete(response);

    console.log('SSE CLIENT DISCONNECTED', {
      streamKey,
      clients: clients.size,
    });

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
  const streamKey = getStreamKey(coachId, date);
  const clients = slotClients.get(streamKey);

  console.log('SSE SEND EVENT', {
    streamKey,
    event,
    slotId,
    clients: clients?.size ?? 0,
  });

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
