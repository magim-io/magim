import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import asyncHanlder from "../middleware/async-handler.middleware";
import * as domainService from "../services/domains.service";

const createDomain = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    let domain;
    const domainDto = req.body;
    const user = req.user;

    if (user) {
      domain = await domainService.createDomain({
        user: user,
        domain: domainDto.payload,
        teamId: domainDto.teamId,
      });
    }

    res.status(201).json({
      success: true,
      data: domain,
    });
  }
);

export { createDomain };
