import BaseError from "./base-error.error";
import httpStatusCodes from "./http-status-codes.constant";

export default class Api401Error extends BaseError {
  constructor(
    name: string,
    statusCode = httpStatusCodes.UNAUTHORIZED,
    description = "Unauthorized.",
    isOperational = true
  ) {
    super(name, statusCode, description, isOperational);
  }
}
