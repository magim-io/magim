import { Request, NextFunction, Response } from "express";
import BaseError from "../../lib/errors/base-error.error";
import asyncHanlder from "../middleware/async-handler.middleware";
import * as eventService from "../services/events.service";

const installDependencyMapAction = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const installationId = req.body.installation.id;
    const action = req.body.action;
    let event;

    if (action === "created") {
      event = await eventService.installDependencyMapAction({
        installationId: installationId,
        branch: "main",
        owner: "f-plms",
        reference: "refs/heads/main",
        repository: "hunterrank",
      });
    }
    if (event instanceof BaseError) {
      return next(event);
    }

    res.status(200).json({
      success: true,
      data: "Magim Github App installed successfully.",
    });
  }
);

export { installDependencyMapAction };
