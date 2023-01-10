import { NextFunction, Request, Response } from "express";
import { get } from "lodash";
import BaseError from "../../lib/errors/base-error.error";
import asyncHanlder from "../middleware/async-handler.middleware";
import * as teamService from "../services/teams.service";

const createTeam = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const teamDto = req.body;
    let team;

    if (user && teamDto) {
      team = await teamService.createTeam({
        team: teamDto.payload,
        organizationId: teamDto.organizationId,
        user: user,
      });
    }

    if (team instanceof BaseError) {
      return next(team);
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
    const teamId = get(req, "query.team");
    const orgId = get(req, "query.org");
    let joined;

    if (user && orgId && teamId) {
      joined = await teamService.joinTeam({
        user: user,
        organizationId: orgId,
        teamId: teamId,
      });
    }

    if (joined instanceof BaseError) {
      return next(joined);
    }

    res.status(201).json({
      success: true,
      data: joined,
    });
  }
);

export { createTeam, joinTeam };
