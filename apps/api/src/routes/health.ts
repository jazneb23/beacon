import { Router } from "express";
import { sendData } from "../http.js";

export const healthRouter = Router();

/** Liveness probe for load balancers and deploy checks. */
healthRouter.get("/healthz", (_req, res) => {
  sendData(res, { status: "ok" });
});
