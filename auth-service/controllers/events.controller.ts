import { Request, NextFunction, Response } from "express";
import asyncHanlder from "../middleware/async-handler.middleware";
import * as eventService from "../services/events.service";

const installDependencyMapAction = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const installationId = req.body.installation.id;
    const action = req.body.action;

    if (action === "created") {
      await eventService.installDependencyMapAction({
        installationId: installationId,
        branch: "main",
        owner: "f-plms",
        reference: "refs/heads/main",
        repository: "hunterrank",
      });
    }
  }
);

export { installDependencyMapAction };
