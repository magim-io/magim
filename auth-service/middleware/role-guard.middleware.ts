import { NextFunction, Request, Response } from "express";
import Api403Error from "../../lib/errors/api-403.error";

const roleGuard = (...roles: any[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.user !== undefined) {
      if (!roles.includes(req.user.type)) {
        return next(
          new Api403Error(
            `User role ${req.user.type} is not authorized to access this route`
          )
        );
      }
    }
    next();
  };
};

export default roleGuard;
