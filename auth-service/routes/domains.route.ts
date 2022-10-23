import express from "express";
import {
  createDomain,
  retrieveDomains,
} from "../controllers/domains.controller";
import roleGuard from "../middleware/role-guard.middleware";
import routeGuard from "../middleware/route-guard.middleware";

const domainRouter = express.Router();

domainRouter
  .route("/")
  .post(routeGuard, createDomain)
  .get(routeGuard, retrieveDomains);

export default domainRouter;
