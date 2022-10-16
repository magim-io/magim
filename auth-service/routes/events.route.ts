import express from "express";
import { installDependencyMapAction } from "../controllers/events.controller";

const eventRouter = express.Router();

eventRouter
  .route("/install-dependencymap-action")
  .post(installDependencyMapAction);

export default eventRouter;
