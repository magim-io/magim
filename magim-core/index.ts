import express, { Express } from "express";
import authRouter from "./routes/auth.route";
import {
  errorHandler,
  isOperationalError,
  logError,
} from "./middleware/error-handler.middleware";
import cors from "cors";
import cookieParser from "cookie-parser";
import orgRouter from "./routes/organizations.route";
import teamRouter from "./routes/teams.route";
import domainRouter from "./routes/domains.route";
import eventRouter from "./routes/events.route";
import httpLogger from "./middleware/http-logger.middleware";
import mapRouter from "./routes/maps.route";
import Config from "./config/config";

const app: Express = express();

Config.getInstance();
const CONFIG = Config.getInstance().config;

app.use(cors());
app.use(express.json());
app.use(cookieParser());

if (CONFIG.ENV === "development") {
  // app.use(morgan("dev"));
  app.use(httpLogger);
}

app.use("/api/auth/github", authRouter);
app.use("/api/v1/organizations", orgRouter);
app.use("/api/v1/teams", teamRouter);
app.use("/api/v1/domains", domainRouter);
app.use("/api/v1/events", eventRouter);
app.use("/api/v1/maps", mapRouter);
app.use(errorHandler);

const server = app.listen(CONFIG.SERVER.PORT, () => {
  console.log(
    `Server running in ${CONFIG.ENV} mode on port ${CONFIG.SERVER.PORT}`
  );
});

process.on("unhandledRejection", (err, promise) => {
  throw err;
});

process.on("uncaughtException", (err) => {
  logError(err);

  if (!isOperationalError(err)) {
    server.close(() => process.exit(1));
  }
});
