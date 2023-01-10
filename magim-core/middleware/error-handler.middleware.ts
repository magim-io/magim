import { Request, Response, NextFunction } from "express";
import BaseError from "../../lib/errors/base-error.error";
import logger from "./logger.middleware";

const logError = (err: BaseError | Error) => {
  logger.error(err);
};

const isOperationalError = (err: BaseError | Error) => {
  if (err instanceof BaseError) {
    return err.isOperational;
  }
  return false;
};

const errorHandler = (
  err: BaseError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error(err);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err || "Server error",
  });
};

export { errorHandler, logError, isOperationalError };
