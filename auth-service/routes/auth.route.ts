import express from "express";
import { loginWithGithub } from "../controllers/auth.controller";

const router = express.Router();

router.route("/").get(loginWithGithub);

export default router;
