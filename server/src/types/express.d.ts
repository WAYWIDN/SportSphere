import { AuthTokenPayload } from '../modules/auth/utils/jwtUtils';

declare global {
  namespace Express {
    interface Request {
      userMetadata?: AuthTokenPayload;
    }
  }
}

export {};
