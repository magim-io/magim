import express from "express";
import { loginWithGithub } from "../controllers/auth.controller";

const authRouter = express.Router();

authRouter.route("/").get(loginWithGithub);

export default authRouter;
