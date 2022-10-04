import { Request, Response, NextFunction } from "express";
import asyncHanlder from "../middleware/async-handler.middleware";
import * as orgService from "../services/organization.service";

const createOrg = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const orgDto = req.body;
    let org;

    if (req.user) {
      org = await orgService.createOrg({
        organization: orgDto,
        owner: req.user,
      });
    }

    res.status(201).json({
      success: true,
      data: org,
    });
  }
);

const retrieveOrg = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const orgId = req.params["orgId"];
    let org;

    if (user && orgId) {
      const type = user.type;

      switch (type) {
        case "MEMBER":
          org = await orgService.retrieveOrg({
            user: user,
            isOwner: false,
            organizationId: orgId,
          });
          break;

        case "OWNER":
          org = await orgService.retrieveOrg({
            user: user,
            isOwner: true,
            organizationId: orgId,
          });
          break;
      }
    }

    res.status(200).json({
      success: true,
      data: org,
    });
  }
);

const retrieveOrgs = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    let orgs;

    if (user) {
      const type = user.type;

      switch (type) {
        case "MEMBER":
          orgs = await orgService.retrieveOrgs({ user: user, isOwner: false });
          break;

        case "OWNER":
          orgs = await orgService.retrieveOrgs({ user: user, isOwner: true });
          break;
      }
    }

    res.status(200).json({
      success: true,
      data: orgs,
    });
  }
);

const deleteOrg = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const owner = req.user;
    const orgId = req.params["orgId"];
    let org;

    if (owner && orgId) {
      org = await orgService.deleteOrg({ organizationId: orgId, owner: owner });
    }

    res.status(204).json({
      success: true,
      data: org,
    });
  }
);

export { createOrg, retrieveOrg, retrieveOrgs, deleteOrg };
