import express from "express";
import hashingRoutes from "./routes/hasing.routes";

export const createApp = () => {
  const app = express();

  app.use(express.json());

  app.use("/hash", hashingRoutes);

  return app;
};