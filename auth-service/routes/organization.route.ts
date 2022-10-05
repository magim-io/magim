import express from "express";
import {
  createOrg,
  retrieveOrg,
  retrieveOrgs,
  deleteOrg,
  inviteMember,
  joinOrg,
} from "../controllers/organization.controller";
import roleGuard from "../middleware/role-guard.middleware";
import routeGuard from "../middleware/route-guard.middleware";

const orgRouter = express.Router();

orgRouter
  .route("/")
  .get(routeGuard, roleGuard("MEMBER", "OWNER"), retrieveOrgs)
  .post(routeGuard, roleGuard("OWNER"), createOrg);

orgRouter
  .route("/:orgId")
  .get(routeGuard, roleGuard("MEMBER", "OWNER"), retrieveOrg)
  .delete(routeGuard, roleGuard("MEMBER", "OWNER"), deleteOrg);

orgRouter
  .route("/members/invite")
  .post(routeGuard, roleGuard("MEMBER", "OWNER"), inviteMember);

orgRouter.route("/members/join").get(routeGuard, joinOrg);

export default orgRouter;
