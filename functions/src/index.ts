import * as logger from "firebase-functions/logger";
import { onRequest } from "firebase-functions/v2/https";

export const hello = onRequest((req, res) => {
  logger.info("hello called", { method: req.method });
  res.status(200).json({ ok: true, message: "Frontle backend is live." });
});