import type { Request, Response } from "express";

/** Send a successful JSON payload. */
export function sendData<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ data });
}

/** Send a JSON error payload. */
export function sendError(res: Response, error: string, status = 400): void {
  res.status(status).json({ error });
}

/** Wrap async route handlers so rejections reach Express error handling. */
export function asyncHandler(
  handler: (req: Request, res: Response) => Promise<void>,
): (req: Request, res: Response) => void {
  return (req, res) => {
    void handler(req, res).catch(() => {
      sendError(res, "Internal server error", 500);
    });
  };
}
