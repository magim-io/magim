import { Request, Response, NextFunction } from "express";
import Api401Error from "../../lib/errors/api-401.error";
import asyncHanlder from "../middleware/async-handler.middleware";
import * as authService from "../services/auth.service";
import { get } from "lodash";
import { GithubUser } from "../models/github-user.model";
import jwt from "jsonwebtoken";
import CONFIG from "../config/config";
import BaseError from "../../lib/errors/base-error.error";

const loginWithGithub = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const code = get(req, "query.code") as string;
    const path = get(req, "query.path", "/");

    if (!code) {
      return next(new Api401Error("Github code is missing"));
    }

    const githubUser = await authService.retrieveGithubUser({
      code,
    });

    if (githubUser instanceof BaseError) {
      return next(githubUser);
    }

    const user = await authService.loginWithGithub({
      user: githubUser,
    });

    if (user instanceof BaseError) {
      return next(user);
    }

    if (user !== null) {
      if (!!CONFIG.SERVER.JWT_SECRET) {
        const token = jwt.sign(user, CONFIG.SERVER.JWT_SECRET);
        res.cookie(CONFIG.SERVER.COOKIE_NAME, token, {
          // httpOnly: true,
          domain: `localhost`,
        });
      }
    }

    res.redirect(`http://localhost:${CONFIG.WEB.PORT}`);
  }
);

export { loginWithGithub };
