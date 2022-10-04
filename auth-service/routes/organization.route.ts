import express from "express";
import {
  createOrg,
  retrieveOrg,
  retrieveOrgs,
  deleteOrg,
} from "../controllers/organization.controller";
import roleGuard from "../middleware/role-guard.middleware";
import routeGuard from "../middleware/route-guard.middleware";

const orgRouter = express.Router();

orgRouter
  .route("/:orgId")
  .get(routeGuard, roleGuard("MEMBER", "OWNER"), retrieveOrg)
  .delete(routeGuard, roleGuard("MEMBER", "OWNER"), deleteOrg);

orgRouter
  .route("/")
  .get(routeGuard, roleGuard("MEMBER", "OWNER"), retrieveOrgs)
  .post(routeGuard, roleGuard("OWNER"), createOrg);

export default orgRouter;
