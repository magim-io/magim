import BaseError from "./base-error.error";
import httpStatusCodes from "./http-status-codes.constant";

export default class Api403Error extends BaseError {
  constructor(
    name: string,
    statusCode = httpStatusCodes.FORBIDDEN,
    description = "Forbidden",
    isOperational = true
  ) {
    super(name, statusCode, description, isOperational);
  }
}
