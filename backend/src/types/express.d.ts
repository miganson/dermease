import type { AuthenticatedUser, RequestUserPayload } from "./api.js";

declare global {
  namespace Express {
    interface Request {
      auth?: RequestUserPayload;
      currentUser?: AuthenticatedUser;
    }
  }
}

export {};

