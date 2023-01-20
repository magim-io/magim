import { Request, NextFunction, Response } from "express";
import BaseError from "../../lib/errors/base-error.error";
import asyncHanlder from "../middleware/async-handler.middleware";
import * as eventService from "../services/events.service";
import {
  INSTALLATION,
  MAGIM_DEPENDENCYMAP,
  WORKFLOW_RUN,
} from "../../lib/constants/events.constant";
import { COMPLETED, CREATED } from "../../lib/constants/actions.constant";
import Api500Error from "../../lib/errors/api-500.error";

const eventsHandler = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const event = req.headers["x-github-event"];

    // switch (event) {
    //   // case INSTALLATION:
    //   //   handleDependencyMapWorkflowInstallation(req, res, next);
    //   //   break;

    //   // case WORKFLOW_RUN:
    //   //   handleWorkflowRun(req, res, next);
    //   //   break;

    //   // case MAGIM_DEPENDENCYMAP:
    //   //   handleDependencyMap(req, res, next);
    //   //   break;

    //   default:
    //     next(new Api500Error("Unhandled event"));
    //     break;
    // }
  }
);

export { eventsHandler };
