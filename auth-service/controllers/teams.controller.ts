import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import asyncHanlder from "../middleware/async-handler.middleware";
import * as teamService from "../services/teams.service";

const createTeam = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const teamDto = req.body;
    const orgId = get(req, "query.orgId");
    let team;

    if (user && teamDto && orgId) {
      team = await teamService.createTeam({
        team: teamDto,
        organizationId: orgId,
        user: user,
        isOwner: true,
      });
    }

    res.status(201).json({
      success: true,
      data: team,
    });
  }
);

const joinTeam = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const teamId = req.params["teamId"];
    const orgId = get(req, "query.orgId");
    let joined;

    if (user && orgId && teamId) {
      joined = await teamService.joinTeam({
        user: user,
        organizationId: orgId,
        teamId: teamId,
      });
    }

    res.status(201).json({
      success: true,
      data: joined,
    });
  }
);

export { createTeam, joinTeam };
