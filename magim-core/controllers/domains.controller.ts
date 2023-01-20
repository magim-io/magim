import { NextFunction, Request, Response } from "express";
import Api403Error from "../../lib/errors/api-403.error";
import BaseError from "../../lib/errors/base-error.error";
import asyncHanlder from "../middleware/async-handler.middleware";
import * as domainService from "../services/domains.service";
import { GithubInstallation } from "../../lib/types/github-installation";
import { VersionDTO } from "../dto/version.dto";

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

const runWorkflow = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const versionDto: VersionDTO = req.body;
    let run;

    if (versionDto) {
      run = await domainService.runWorkflow({
        version: versionDto,
      });
    }

    if (run instanceof BaseError) {
      return next(run);
    }

    res.status(200).json({
      success: true,
      data: "Workflow ran successfully",
    });
  }
);

const retrieveMaps = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const domainId = req.params["domainId"];

    const maps = await domainService.retrieveMaps({
      domainId: domainId,
      user: user!,
    });

    if (maps instanceof BaseError) {
      return next(maps);
    }

    res.status(201).json({
      success: true,
      data: maps,
    });
  }
);

export { createDomain, retrieveDomains, runWorkflow, retrieveMaps };
