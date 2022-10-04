import express, { Express } from "express";
import authRouter from "./routes/auth.route";
import morgan from "morgan";
import errorHandler from "./middleware/error-handler.middleware";
import CONFIG from "./config/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import orgRouter from "./routes/organization.route";

const app: Express = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

if (CONFIG.ENV === "development") {
  app.use(morgan("dev"));
}

app.use("/api/auth/github", authRouter);
app.use("/api/v1/organizations", orgRouter);

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
