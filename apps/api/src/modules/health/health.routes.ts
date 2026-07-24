import { Router } from "express";
import { checkDatabase } from "../../core/database/prisma.js";

export const healthRouter = Router();

healthRouter.get("/health", async (_req, res) => {
  const database = await checkDatabase();

  res.status(database === "ok" ? 200 : 200).json({
    status: "ok",
    service: "focustouch-api",
    database,
    timestamp: new Date().toISOString(),
  });
});
