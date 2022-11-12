import express from "express";
import { eventsHandler } from "../controllers/events.controller";

const eventRouter = express.Router();

eventRouter.route("/").post(eventsHandler);

export default eventRouter;
