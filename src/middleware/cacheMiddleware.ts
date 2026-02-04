import { Request, Response, NextFunction } from "express";
import { ENV } from "@/config/env";

interface CacheOptions {
  duration?: number;
}

/**
 * Tenant-safe cache control middleware
 * - Uses PRIVATE cache only
 * - Varies by Authorization header
 * - Safe for multitenant APIs
 */
export const cache = (options: CacheOptions = {}) => {
  const duration = options.duration ?? 300; // seconds

  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      res.set("Cache-Control", "no-store");
      return next();
    }

    // Never cache in non-production
    if (ENV.NODE_ENV !== "production") {
      res.set("Cache-Control", "no-store");
      return next();
    }

    // Authenticated + multitenant-safe cache headers
    res.set({
      "Cache-Control": `private, max-age=${duration}`,
      Vary: "Authorization",
    });

    next();
  };
};
