import jwt from "jsonwebtoken";
import asyncHanlder from "./async-handler.middleware";
import ErrorResponse from "../../common/exceptions/error-response.exception";
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

    if (req.cookies.mgt) {
      token = req.cookies.mgt;
    }

    if (!token) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }

    try {
      const decoded = jwt.verify(token, get(CONFIG, "SERVER.JWT_SECRET"));

      const user = await prisma.user.findFirst({
        where: {
          id: get(decoded, "id"),
        },
      });

      if (user === null) {
        return next(
          new ErrorResponse("Not authorized to access this route", 401)
        );
      }

      req.user = user;

      next();
    } catch (err) {
      return next(
        new ErrorResponse("Not authorized to access this route", 401)
      );
    }
  }
);

export default routeGuard;
