import { Request, NextFunction, Response } from "express";
import BaseError from "../../lib/errors/base-error.error";
import asyncHanlder from "../middleware/async-handler.middleware";
import * as eventService from "../services/events.service";
import {
  INSTALLATION,
  MAGIM_DEPENDENCYMAP,
  WORKFLOW_RUN,
} from "../../lib/constants/events";
import { COMPLETED, CREATED } from "../../lib/constants/actions";
import Api500Error from "../../lib/errors/api-500.error";

const eventsHandler = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const event = req.headers["x-github-event"];

    switch (event) {
      case INSTALLATION:
        handleDependencyMapWorkflowInstallation(req, res, next);
        break;

      // case WORKFLOW_RUN:
      //   handleWorkflowRun(req, res, next);
      //   break;

      // case MAGIM_DEPENDENCYMAP:
      //   handleDependencyMap(req, res, next);
      //   break;

      default:
        next(new Api500Error("Unhandled event"));
        break;
    }
  }
);

const handleDependencyMapWorkflowInstallation = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const installationId = req.body.installation.id;
    const action = req.body.action;
    let event;

    if (action === CREATED) {
      event = await eventService.installDependencyMapAction({
        installationId: installationId,
        branch: "main",
        owner: "magim-io",
        reference: "refs/heads/magim-managed-branch",
        repository: "hunterrank",
      });
    }

    if (event instanceof BaseError) {
      return next(event);
    }

    res.status(200).json({
      success: true,
      data: "Magim Github App installed successfully",
    });
  }
);

// const handleDependencyMap = asyncHanlder(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const event = req.headers["x-github-event"];
//     const repository = req.headers["x-github-repository"];
//     const payload = req.body;

//     console.log("\nevent", event);
//     console.log("\nrepository", repository);
//     console.log("\npayload", payload);
//   }
// );

// const handleWorkflowRun = asyncHanlder(
//   async (req: Request, res: Response, next: NextFunction) => {
//     const action = req.body.action;
//     const workflow = req.body.workflow;
//     const artifactsUrl = req.body.workflow_run.artifacts_url;
//     let artifact;

//     if (workflow.path === ".github/workflows/magim-dependencymap.yml") {
//       if (action === COMPLETED) {
//         console.log("\ncompleted");
//         // artifact = await eventService.retrieveWorkflowArtifact({
//         //   owner: "f-plms",
//         //   repo: "hunterrank",
//         //   artifactsUrl: artifactsUrl,
//         // });
//         // if (artifact instanceof BaseError) {
//         //   return next(artifact);
//         // }
//         // console.table(artifact);
//       }
//     }
//   }
// );

export { eventsHandler };
