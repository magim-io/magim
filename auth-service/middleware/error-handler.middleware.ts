import { Request, Response, NextFunction } from "express";
import ErrorResponse from "../../lib/exceptions/error-response.exception";

const errorHandler = (
  err: ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(`Error: ${err.stack}`);
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Server error",
  });
};

export default errorHandler;
