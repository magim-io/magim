import { Request, Response, NextFunction } from "express";
import BaseError from "../../lib/errors/base-error.error";
import asyncHanlder from "../middleware/async-handler.middleware";
import * as mapService from "../services/maps.service";

const createMap = asyncHanlder(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const repository = JSON.stringify(req.headers["x-github-repository"]);
    let map;

    map = await mapService.createMap({
      payload: JSON.stringify(payload),
      repository: repository,
    });

    if (map instanceof BaseError) {
      return next(map);
    }

    res.status(201).json({
      success: true,
      data: map,
    });
  }
);

export { createMap };
