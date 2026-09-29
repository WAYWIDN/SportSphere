import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Booking } from '../../booking/model/bookingModel';
import { queueBookingNotification } from '../../booking/utils/bookingNotificationQueue';
import { Subvenue } from '../../venue-owner/model/subvenueModel';
import { Venue } from '../../venue-owner/model/venueModel';
import { VenueSlot } from '../../venue-owner/model/slotModel';
import { GameJoinRequest } from '../model/gameJoinRequestModel';
import { Game } from '../model/gameModel';
import { addGameClient, sendGameEvent } from '../utils/gameEventUtils';
import { queueGameNotification } from '../utils/gameNotificationQueue';
import {
  loadPublicUsers,
  toPublicUser,
} from '../../profile-management/utils/userNameUtils';

const PAGE_SIZE = 10;

const getPage = <T extends { _id: Types.ObjectId }>(items: T[]) => {
  const hasNext = items.length > PAGE_SIZE;
  const data = items.slice(0, PAGE_SIZE);

  return {
    data,
    hasNext,
    lastId: hasNext ? data[data.length - 1]._id : null,
  };
};

const getGamePlayerIds = (game: { creatorId: any; acceptedPlayerIds: any[] }) =>
  game.acceptedPlayerIds.map((id) =>
    typeof id === 'object' && id?._id ? id._id.toString() : id.toString(),
  );

export const getPopulatedGame = async (gameId: Types.ObjectId | string) => {
  const game = await Game.findById(gameId)
    .populate({
      path: 'subvenueId',
      populate: { path: 'venueId', select: 'name location images' },
    })
    .populate('slotId')
    .lean();

  if (!game) return null;

  const acceptedRequests = await GameJoinRequest.find({
    gameId: game._id,
    status: 'accepted',
  })
    .select('userId createdAt respondedAt')
    .lean();

  const joinTimeMap = new Map<string, Date>();
  for (const req of acceptedRequests) {
    joinTimeMap.set(req.userId.toString(), req.respondedAt || req.createdAt);
  }

  const users = await loadPublicUsers([
    game.creatorId,
    ...game.acceptedPlayerIds,
  ]);
  const creator = toPublicUser(game.creatorId, users);

  const populatedPlayers = (game.acceptedPlayerIds || []).map((playerId) => {
    const playerIdStr = playerId.toString();
    const isHost = playerIdStr === creator._id;
    const joinedAt = isHost
      ? game.createdAt
      : joinTimeMap.get(playerIdStr) || game.createdAt;

    return {
      ...toPublicUser(playerId, users),
      joinedAt,
      isHost,
    };
  });

  return {
    ...game,
    creatorId: creator,
    acceptedPlayerIds: populatedPlayers,
  };
};

export const createGameController = async (req: Request, res: Response) => {
  const creatorId = req.userMetadata?.id;
  const { subvenueId, slotId, minimumPlayers, maximumPlayers } = req.body;

  if (!creatorId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const slot = await VenueSlot.findOne({
      _id: slotId,
      subvenueId,
      status: 'available',
    });
    if (!slot) {
      return res
        .status(409)
        .json({ success: false, message: 'Slot is no longer available' });
    }

    if (slot.endEpoch <= Date.now()) {
      return res
        .status(409)
        .json({ success: false, message: 'Slot has already ended' });
    }

    const hasOverlappingBooking = await Booking.exists({
      userId: creatorId,
      status: 'confirmed',
      startEpoch: { $lt: slot.endEpoch },
      endEpoch: { $gt: slot.startEpoch },
    });
    if (hasOverlappingBooking) {
      return res.status(409).json({
        success: false,
        message: 'You already have a booking at this time',
      });
    }

    const game = await Game.create({
      creatorId,
      subvenueId,
      slotId,
      minimumPlayers,
      maximumPlayers,
      acceptedPlayerIds: [creatorId],
      status: minimumPlayers <= 1 ? 'ready' : 'forming',
    });

    const populatedGame = await getPopulatedGame(game._id);
    if (!populatedGame) {
      return res
        .status(500)
        .json({ success: false, message: 'Failed to load created game' });
    }

    if (populatedGame.status === 'ready') {
      sendGameEvent(game._id.toString(), 'game_ready', { game: populatedGame });
    }

    return res.status(201).json({
      success: true,
      message: 'Game created successfully',
      data: populatedGame,
    });
  } catch (error) {
    console.error('Error creating game:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to create game' });
  }
};

export const searchGamesController = async (req: Request, res: Response) => {
  const {
    subvenueId,
    subvenueName,
    sport,
    date,
    status,
    minPlayers,
    maxPlayers,
    lastGameId,
  } = req.body as {
    subvenueId?: string;
    subvenueName?: string;
    sport?: string;
    date?: string;
    status?: 'forming' | 'ready';
    minPlayers?: number;
    maxPlayers?: number;
    lastGameId?: string;
  };

  try {
    const filter: Record<string, unknown> = {};
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ['forming', 'ready'] };
    }

    if (subvenueId) {
      filter.subvenueId = subvenueId;
    } else if (subvenueName || sport) {
      const subvenueQuery: Record<string, unknown> = {};
      if (subvenueName) {
        subvenueQuery.name = { $regex: subvenueName.trim(), $options: 'i' };
      }
      if (sport) {
        subvenueQuery.sport = { $regex: sport.trim(), $options: 'i' };
      }
      const matchingSubvenues = await Subvenue.find(subvenueQuery)
        .select('_id')
        .lean();
      filter.subvenueId = { $in: matchingSubvenues.map((sv) => sv._id) };
    }

    if (date) {
      const slots = await VenueSlot.find({ date }).select('_id').lean();
      filter.slotId = { $in: slots.map((slot) => slot._id) };
    }
    if (minPlayers !== undefined) {
      filter.minimumPlayers = { $lte: minPlayers };
    }

    if (maxPlayers !== undefined) {
      filter.maximumPlayers = { $gte: maxPlayers };
    }

    if (lastGameId) {
      filter._id = { $lt: new Types.ObjectId(lastGameId) };
    }

    const games = await Game.find(filter)
      .sort({ _id: -1 })
      .limit(PAGE_SIZE + 1)
      .populate({
        path: 'subvenueId',
        populate: { path: 'venueId', select: 'name location images' },
      })
      .populate('slotId')
      .lean();

    const page = getPage(games);
    const userIds = page.data.flatMap((game) => [
      game.creatorId,
      ...game.acceptedPlayerIds,
    ]);
    const users = await loadPublicUsers(userIds);
    const data = page.data.map((game) => ({
      ...game,
      creatorId: toPublicUser(game.creatorId, users),
      acceptedPlayerIds: game.acceptedPlayerIds.map((playerId) =>
        toPublicUser(playerId, users),
      ),
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        limit: PAGE_SIZE,
        lastGameId: page.lastId,
        hasNext: page.hasNext,
      },
    });
  } catch (error) {
    console.error('Error searching games:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to search games' });
  }
};

export const getGameController = async (req: Request, res: Response) => {
  try {
    const gameId = req.params.gameId as string;
    const game = await getPopulatedGame(gameId);
    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: 'Game not found' });
    }

    return res.status(200).json({ success: true, data: game });
  } catch (error) {
    console.error('Error retrieving game:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to retrieve game' });
  }
};

export const getMyGamesController = async (req: Request, res: Response) => {
  const userId = req.userMetadata?.id;

  const lastGameId = req.query.lastGameId as string | undefined;

  try {
    const filter: Record<string, unknown> = {
      $or: [{ creatorId: userId }, { acceptedPlayerIds: userId }],
    };

    if (lastGameId) {
      filter._id = { $lt: new Types.ObjectId(lastGameId) };
    }

    const games = await Game.find(filter)
      .sort({ _id: -1 })
      .limit(PAGE_SIZE + 1)
      .populate({
        path: 'subvenueId',
        populate: { path: 'venueId', select: 'name location images' },
      })
      .populate('slotId')
      .lean();

    const page = getPage(games);
    const userIds = page.data.flatMap((game) => [
      game.creatorId,
      ...game.acceptedPlayerIds,
    ]);
    const users = await loadPublicUsers(userIds);
    const data = page.data.map((game) => ({
      ...game,
      creatorId: toPublicUser(game.creatorId, users),
      acceptedPlayerIds: game.acceptedPlayerIds.map((playerId) =>
        toPublicUser(playerId, users),
      ),
    }));

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        limit: PAGE_SIZE,
        lastGameId: page.lastId,
        hasNext: page.hasNext,
      },
    });
  } catch (error) {
    console.error('Error searching games:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to search games' });
  }
};


export const streamGameController = async (req: Request, res: Response) => {
  const userId = req.userMetadata?.id as string;
  const gameId = req.params.gameId as string;

  try {
    const existingGame = await Game.findOne({
      _id: gameId,
      $or: [{ creatorId: userId }, { acceptedPlayerIds: userId }],
    }).lean();

    if (!existingGame) {
      return res
        .status(403)
        .json({ success: false, message: 'You are not part of this game' });
    }

    const game = await getPopulatedGame(gameId);

    res.status(200);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    res.write(`event: game_state\ndata: ${JSON.stringify({ game })}\n\n`);

    const removeClient = addGameClient(gameId, res);
    const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 30000);
    req.on('close', () => {
      clearInterval(heartbeat);
      removeClient();
    });
  } catch (error) {
    console.error('Error opening game stream:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to open game stream' });
  }
};

export const createJoinRequestController = async (
  req: Request,
  res: Response,
) => {
  const userId = req.userMetadata?.id;
  const gameId = req.params.gameId as string;

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const game = await Game.findOne({
      _id: gameId,
      status: 'forming',
    });
    if (!game) {
      return res
        .status(409)
        .json({ success: false, message: 'Game is not accepting requests' });
    }
    if (game.creatorId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Game creator cannot request to join their own game',
      });
    }

    const slot = await VenueSlot.findOne({
      _id: game.slotId,
      status: 'available',
    }).lean();
    if (!slot || slot.endEpoch <= Date.now()) {
      return res
        .status(409)
        .json({ success: false, message: 'Game slot is no longer available' });
    }

    const isAlreadyAccepted = game.acceptedPlayerIds.some(
      (playerId) => playerId.toString() === userId,
    );
    if (isAlreadyAccepted) {
      return res.status(409).json({
        success: false,
        message: 'You are already part of this game',
      });
    }

    const existingRequest = await GameJoinRequest.findOne({
      gameId: game._id,
      userId,
    });
    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You have already requested this game',
      });
    }

    const request = await GameJoinRequest.create({ gameId: game._id, userId });
    await queueGameNotification({
      gameId: game._id.toString(),
      recipientIds: [game.creatorId.toString()],
      status: 'join-requested',
    });
    sendGameEvent(game._id.toString(), 'join_request_created', {
      requestId: request._id,
      userId,
      gameId: game._id.toString(),
    });
    return res.status(201).json({
      success: true,
      message: 'Join request sent successfully',
      data: request,
    });
  } catch (error) {
    console.error('Error creating game join request:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to send join request' });
  }
};

export const getJoinRequestsController = async (
  req: Request,
  res: Response,
) => {
  const creatorId = req.userMetadata?.id;

  if (!creatorId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
    const game = await Game.findOne({
      _id: req.params.gameId,
      creatorId,
    });
    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: 'Game not found' });
    }

    const requests = await GameJoinRequest.find({ gameId: game._id })
      .sort({ _id: -1 })
      .lean();
    const users = await loadPublicUsers(
      requests.map((request) => request.userId),
    );
    const data = requests.map((request) => ({
      ...request,
      userId: toPublicUser(request.userId, users),
    }));
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error retrieving game join requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve game join requests',
    });
  }
};

export const updateJoinRequestController = async (
  req: Request,
  res: Response,
) => {
  const { gameId, requestId } = req.params as {
    gameId: string;
    requestId: string;
  };
  const status = req.body.status as 'accepted' | 'rejected';

  try {
    const request = await GameJoinRequest.findOne({
      _id: requestId,
      gameId,
      status: 'pending',
    });
    const game = await Game.findOne({
      _id: gameId,
      creatorId: req.userMetadata?.id,
    });
    if (!request || !game) {
      return res.status(409).json({
        success: false,
        message: 'Request was not found or has already been processed',
      });
    }

    if (status === 'rejected') {
      request.status = 'rejected';
      request.respondedAt = new Date();
      await request.save();
      await queueGameNotification({
        gameId: game._id.toString(),
        recipientIds: [request.userId.toString()],
        status: 'join-rejected',
      });
      sendGameEvent(game._id.toString(), 'join_request_rejected', {
        requestId: request._id,
        userId: request.userId,
      });
      return res.status(200).json({ success: true, data: request });
    }

    const acceptedRequest = await GameJoinRequest.findOneAndUpdate(
      { _id: request._id, status: 'pending' },
      { status: 'accepted', respondedAt: new Date() },
      { new: true },
    );
    if (!acceptedRequest) {
      return res.status(409).json({
        success: false,
        message: 'Request was already processed',
      });
    }

    const updatedGame = await Game.findOneAndUpdate(
      {
        _id: gameId,
        status: 'forming',
        $expr: {
          $lt: [{ $size: '$acceptedPlayerIds' }, '$maximumPlayers'],
        },
      },
      {
        $addToSet: { acceptedPlayerIds: acceptedRequest.userId },
        $set: { updatedAt: new Date() },
      },
      { new: true },
    );
    if (!updatedGame) {
      await GameJoinRequest.findByIdAndUpdate(request._id, {
        status: 'pending',
        $unset: { respondedAt: 1 },
      });
      return res.status(409).json({
        success: false,
        message: 'Game has reached maximum capacity or is no longer forming',
      });
    }
    await queueGameNotification({
      gameId: game._id.toString(),
      recipientIds: [acceptedRequest.userId.toString()],
      status: 'join-accepted',
    });

    if (updatedGame.acceptedPlayerIds.length >= updatedGame.minimumPlayers) {
      updatedGame.status = 'ready';
      updatedGame.updatedAt = new Date();
      await updatedGame.save();
      await queueGameNotification({
        gameId: game._id.toString(),
        recipientIds: [game.creatorId.toString()],
        status: 'minimum-reached',
      });
    }

    const populatedGame = await getPopulatedGame(gameId);

    sendGameEvent(game._id.toString(), 'join_request_accepted', {
      requestId: acceptedRequest._id,
      userId: acceptedRequest.userId,
      game: populatedGame,
    });

    if (populatedGame && populatedGame.status === 'ready') {
      sendGameEvent(game._id.toString(), 'game_ready', {
        game: populatedGame,
      });
    }

    return res.status(200).json({
      success: true,
      data: { request: acceptedRequest, game: populatedGame },
    });
  } catch (error) {
    console.error('Error updating game join request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update game join request',
    });
  }
};

export const bookGameController = async (req: Request, res: Response) => {
  let bookingId: Types.ObjectId | undefined;
  let bookedSlotId: Types.ObjectId | undefined;

  try {
    const game = await Game.findOne({
      _id: req.params.gameId,
      creatorId: req.userMetadata?.id,
      status: 'ready',
    });
    if (!game) {
      return res.status(409).json({
        success: false,
        message: 'Game is not ready to be booked',
      });
    }

    const slot = await VenueSlot.findOneAndUpdate(
      {
        _id: game.slotId,
        subvenueId: game.subvenueId,
        status: 'available',
        endEpoch: { $gt: Date.now() },
      },
      { status: 'booked', updatedAt: new Date() },
      { new: true },
    );
    if (!slot) {
      return res
        .status(409)
        .json({ success: false, message: 'Slot is no longer available' });
    }
    bookedSlotId = slot._id;

    const subvenue = await Subvenue.findById(game.subvenueId).lean();
    const venue = subvenue
      ? await Venue.findById(subvenue.venueId).lean()
      : null;
    if (!venue) {
      await VenueSlot.findByIdAndUpdate(slot._id, {
        status: 'available',
        updatedAt: new Date(),
      });
      return res
        .status(404)
        .json({ success: false, message: 'Venue not found' });
    }

    const booking = await Booking.create({
      userId: game.creatorId,
      providerId: venue.ownerId,
      providerType: 'venue',
      resourceId: slot._id,
      sourceGameId: game._id,
      startEpoch: slot.startEpoch,
      endEpoch: slot.endEpoch,
    });
    bookingId = booking._id;

    game.status = 'booked';
    game.bookingId = booking._id;
    game.updatedAt = new Date();
    await game.save();

    await queueBookingNotification({
      bookingId: booking._id.toString(),
      status: 'confirmed',
    });
    await queueGameNotification({
      gameId: game._id.toString(),
      recipientIds: getGamePlayerIds(game),
      status: 'booked',
    });
    const populatedGame = await getPopulatedGame(game._id);

    sendGameEvent(game._id.toString(), 'game_booked', {
      bookingId: booking._id,
      game: populatedGame,
    });

    return res
      .status(200)
      .json({ success: true, data: { game: populatedGame, booking } });
  } catch (error) {
    if (bookingId) {
      await Booking.findByIdAndDelete(bookingId);
    }
    if (bookedSlotId) {
      await VenueSlot.findOneAndUpdate(
        { _id: bookedSlotId, status: 'booked' },
        { status: 'available', updatedAt: new Date() },
      );
    }
    console.error('Error booking game:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to book game' });
  }
};

export const cancelGameController = async (req: Request, res: Response) => {
  try {
    const game = await Game.findOne({
      _id: req.params.gameId,
      creatorId: req.userMetadata?.id,
      status: { $in: ['forming', 'ready', 'booked'] },
    });
    if (!game) {
      return res
        .status(404)
        .json({ success: false, message: 'Game not found' });
    }

    if (game.bookingId) {
      const booking = await Booking.findOneAndUpdate(
        { _id: game.bookingId, status: 'confirmed' },
        { status: 'cancelled', updatedAt: new Date() },
        { new: true },
      );
      if (booking) {
        await VenueSlot.findOneAndUpdate(
          { _id: booking.resourceId, status: 'booked' },
          { status: 'available', updatedAt: new Date() },
        );
        await queueBookingNotification({
          bookingId: booking._id.toString(),
          status: 'cancelled',
        });
        await queueGameNotification({
          gameId: game._id.toString(),
          recipientIds: getGamePlayerIds(game),
          status: 'cancelled',
        });
      }
    }

    game.status = 'cancelled';
    game.updatedAt = new Date();
    await game.save();

    const populatedGame = await getPopulatedGame(game._id);
    if (!populatedGame) {
      return res
        .status(500)
        .json({ success: false, message: 'Failed to load cancelled game' });
    }

    sendGameEvent(game._id.toString(), 'game_cancelled', {
      game: populatedGame,
    });
    return res.status(200).json({ success: true, data: populatedGame });
  } catch (error) {
    console.error('Error cancelling game:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Failed to cancel game' });
  }
};
