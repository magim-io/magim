import jwt from "jsonwebtoken";
import asyncHanlder from "./async-handler.middleware";
import Api401Error from "../../lib/errors/api-401.error";
import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import CONFIG from "../config/config";
import { get } from "lodash";

const routeGuard = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;
    const prisma = new PrismaClient();

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // if (req.cookies.mgt) {
    //   token = req.cookies.mgt;
    // }

    if (!token) {
      return next(new Api401Error("Not authorized to access this route"));
    }

    try {
      const decoded = jwt.verify(token, get(CONFIG, "SERVER.JWT_SECRET"));

      const user = await prisma.user.findFirst({
        where: {
          id: get(decoded, "id"),
        },
      });

      if (user === null) {
        return next(new Api401Error("Not authorized to access this route"));
      }

      req.user = user;

      next();
    } catch (err) {
      return next(new Api401Error("Not authorized to access this route"));
    }
  }
);

export default routeGuard;
