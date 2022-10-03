import express from "express";
import { loginWithGithub } from "../controllers/auth.controller";
import routeGuard from "../middleware/route-guard.middleware";

const authRouter = express.Router();

authRouter.route("/").get(loginWithGithub);

export default authRouter;
