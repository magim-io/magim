import { NextFunction, Request, Response } from "express";
import ErrorResponse from "../../common/exceptions/error-response.exception";

const roleGuard = (...roles: any[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user !== undefined) {
      if (!roles.includes(req.user.type)) {
        return next(
          new ErrorResponse(
            `User role ${req.user.type} is not authorized to access this route`,
            403
          )
        );
      }
    }
    next();
  };
};

export default roleGuard;
