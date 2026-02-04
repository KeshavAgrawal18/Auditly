import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "@/utils/appError";
import { ErrorCode } from "@/utils/errorCodes";
import { logger } from "@/config/logger";
import { ENV } from "@/config/env";

export type UserRole = "OWNER" | "ADMIN" | "USER";

interface JwtPayload {
  userId: string;
  companyId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload;
    }
  }
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) {
      throw new AppError("No token provided", 401, ErrorCode.UNAUTHORIZED);
    }

    const decoded = jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;

    req.user = {
      userId: decoded.userId,
      companyId: decoded.companyId,
      role: decoded.role,
    };

    next();
  } catch (error) {
    logger.warn({
      message: "Authentication failed",
      context: "AuthMiddleware.requireAuth",
      error: error instanceof Error ? error.message : "Unknown error",
    });

    next(
      new AppError(
        "Unauthorized - Invalid or expired token",
        401,
        ErrorCode.INVALID_TOKEN,
      ),
    );
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AppError("Unauthorized", 401, ErrorCode.UNAUTHORIZED);
      }

      if (!roles.includes(req.user.role)) {
        logger.warn({
          message: "Insufficient permissions",
          context: "AuthMiddleware.requireRole",
          requiredRoles: roles,
          userRole: req.user.role,
          userId: req.user.userId,
          companyId: req.user.companyId,
        });

        throw new AppError(
          "Forbidden - Insufficient permissions",
          403,
          ErrorCode.FORBIDDEN,
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
