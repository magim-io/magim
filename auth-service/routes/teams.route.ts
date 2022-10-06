import express from "express";
import { createTeam, joinTeam } from "../controllers/teams.controller";
import roleGuard from "../middleware/role-guard.middleware";
import routeGuard from "../middleware/route-guard.middleware";

const teamRouter = express.Router();

teamRouter.route("/").post(routeGuard, createTeam);
teamRouter.route("/:teamId").post(routeGuard, joinTeam);

export default teamRouter;
