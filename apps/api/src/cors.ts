import type { NextFunction, Request, Response } from "express";

const DEFAULT_WEB_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://beacon-web-brown.vercel.app",
];

/** Matches Vercel preview deployments (https only, single subdomain chain). */
const VERCEL_PREVIEW_ORIGIN_PATTERN = /^https:\/\/[\w.-]+\.vercel\.app$/;

/** Resolve allowed browser origins from env with local web defaults. */
function getAllowedOrigins(): string[] {
  const configured = process.env.CORS_ORIGINS;
  if (!configured) {
    return DEFAULT_WEB_ORIGINS;
  }

  return configured.split(",").map((origin) => origin.trim());
}

/** Check explicit allowlist entries and Vercel preview URL pattern. */
function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  return VERCEL_PREVIEW_ORIGIN_PATTERN.test(origin);
}

/** Allow cross-origin requests from the Beacon web app. */
export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  if (origin && isOriginAllowed(origin, allowedOrigins)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
}
