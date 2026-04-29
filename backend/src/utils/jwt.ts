import jwt from "jsonwebtoken";
import { config } from "../config";
import { AuthPayload } from "../middleware/auth";

export const generateAccessToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

export const generateRefreshToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

export const verifyAccessToken = (token: string): AuthPayload => {
  return jwt.verify(token, config.jwt.secret) as AuthPayload;
};

export const verifyRefreshToken = (token: string): AuthPayload => {
  return jwt.verify(token, config.jwt.secret) as AuthPayload;
};

export const decodeToken = (token: string): AuthPayload | null => {
  try {
    return jwt.decode(token) as AuthPayload;
  } catch {
    return null;
  }
};
