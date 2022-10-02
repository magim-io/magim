import { Request, Response, NextFunction } from "express";
import ErrorResponse from "../../common/exceptions/error-response.exception";
import asyncHanlder from "../middleware/async-handler.middleware";
import { retrieveGithubUser } from "../services/auth.service";
import { get } from "lodash";
import { GithubUser } from "../models/github-user.model";
import jwt from "jsonwebtoken";
import CONFIG from "../config/config";

const loginWithGithub = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const code = get(req, "query.code");
    const path = get(req, "query.path", "/");

    if (!code) {
      return next(new ErrorResponse("Github code is missing", 401));
    }

    const githubUser: GithubUser = await retrieveGithubUser({ code });

    // @todo: check and register user

    if (!!CONFIG.SERVER.JWT_SECRET) {
      const token = jwt.sign(githubUser, CONFIG.SERVER.JWT_SECRET);
      res.cookie(CONFIG.SERVER.COOKIE_NAME, token, {
        httpOnly: true,
        domain: `localhost`,
      });
    }

    res.redirect(`http://localhost:${CONFIG.WEB.PORT}`);
  }
);

export { loginWithGithub };