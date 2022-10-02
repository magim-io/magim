import express, { Express } from "express";
import authRouter from "./routes/auth.route";
import morgan from "morgan";
import errorHandler from "./middleware/error-handler.middleware";
import CONFIG from "./config/config";
import cors from "cors";

const app: Express = express();

app.use(cors());

if (CONFIG.ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/auth/github", authRouter);

app.use(errorHandler);

const server = app.listen(CONFIG.SERVER.PORT, () => {
  console.log(
    `Server running in ${CONFIG.ENV} mode on port ${CONFIG.SERVER.PORT}`
  );
});

process.on("unhandledRejection", (err: Error, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
