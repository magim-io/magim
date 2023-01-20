import express from "express";
import {
  createDomain,
  retrieveDomains,
  retrieveMaps,
  runWorkflow,
} from "../controllers/domains.controller";
import roleGuard from "../middleware/role-guard.middleware";
import routeGuard from "../middleware/route-guard.middleware";

const domainRouter = express.Router();

domainRouter
  .route("/")
  .post(routeGuard, createDomain)
  .get(routeGuard, retrieveDomains);

domainRouter.route("/:domainId/maps").get(routeGuard, retrieveMaps);

domainRouter.route("/run-workflow").post(routeGuard, runWorkflow);

export default domainRouter;
