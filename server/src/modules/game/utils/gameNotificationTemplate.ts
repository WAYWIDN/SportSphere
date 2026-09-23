import { GameNotificationStatus } from './gameNotificationQueue';

export const getGameNotificationTemplate = (
  status: GameNotificationStatus,
): string => {
  let title = 'Game update';
  let message = 'There is an update for your game.';

  if (status === 'join-requested') {
    title = 'New game join request';
    message = 'A player requested to join your game.';
  } else if (status === 'join-accepted') {
    title = 'Game join request accepted';
    message = 'Your request to join the game was accepted.';
  } else if (status === 'join-rejected') {
    title = 'Game join request rejected';
    message = 'Your request to join the game was rejected.';
  } else if (status === 'minimum-reached') {
    title = 'Game is ready';
    message = 'Your game has reached the minimum number of players.';
  } else if (status === 'booked') {
    title = 'Game booked';
    message = 'Your game has been booked successfully.';
  } else if (status === 'cancelled') {
    title = 'Game cancelled';
    message = 'Your game has been cancelled.';
  }

  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #222;">
    <h1 style="color: #ff8c00;">SportSphere</h1>
    <h2>${title}</h2>
    <p>${message}</p>
  </div>`;
};
