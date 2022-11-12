import express from "express";
import { createMap } from "../controllers/maps.controller";
import roleGuard from "../middleware/role-guard.middleware";
import routeGuard from "../middleware/route-guard.middleware";

const mapRouter = express.Router();

mapRouter.route("/").post(createMap);

export default mapRouter;
