import { NextFunction, Request, Response } from "express";
import Api403Error from "../../lib/errors/api-403.error";
import BaseError from "../../lib/errors/base-error.error";
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

    if (domain instanceof BaseError) {
      return next(domain);
    }

    res.status(200).json({
      success: true,
      data: domain,
    });
  }
);

const retrieveDomains = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let domains;

    if (user) {
      domains = await domainService.retrieveDomains({ user: user });
    }

    if (domains instanceof BaseError) {
      return next(domains);
    }

    res.status(200).json({
      success: true,
      data: domains,
    });
  }
);

export { createDomain, retrieveDomains };
