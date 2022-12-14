import { Request, Response, NextFunction } from "express";
import { get } from "lodash";
import BaseError from "../../lib/errors/base-error.error";
import asyncHanlder from "../middleware/async-handler.middleware";
import * as orgService from "../services/organizations.service";

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

    if (org instanceof BaseError) {
      return next(org);
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
      org = await orgService.retrieveOrg({
        user: user,
        organizationId: orgId,
      });
    }

    if (org instanceof BaseError) {
      return next(org);
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
      orgs = await orgService.retrieveOrgs({ user: user });
    }

    if (orgs instanceof BaseError) {
      return next(orgs);
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

    if (org instanceof BaseError) {
      return next(org);
    }

    res.status(204).json({
      success: true,
      data: org,
    });
  }
);

const inviteMember = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const memberEmail = req.body["memberEmail"];
    const orgId = req.body["organizationId"];
    const user = req.user;
    let member;

    if (user && memberEmail && orgId) {
      member = await orgService.inviteMember({
        user: user,
        memberEmail: memberEmail,
        organizationId: orgId,
      });
    }

    if (member instanceof BaseError) {
      return next(member);
    }

    res.status(201).json({ success: true, data: member });
  }
);

const joinOrg = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const invId = get(req, "query.inv") as string;
    const orgId = get(req, "query.org") as string;
    let joinedOrg;

    if (user && invId && orgId) {
      joinedOrg = await orgService.joinOrg({
        inviatationId: invId,
        user: user,
        organizationId: orgId,
      });
    }

    if (joinedOrg instanceof BaseError) {
      return next(joinedOrg);
    }

    res.status(201).json({
      success: true,
      data: joinedOrg,
    });
  }
);

export {
  createOrg,
  retrieveOrg,
  retrieveOrgs,
  deleteOrg,
  inviteMember,
  joinOrg,
};
