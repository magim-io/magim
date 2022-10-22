import BaseError from "./base-error.error";
import httpStatusCodes from "./http-status-codes.constant";

export default class Api404Error extends BaseError {
  constructor(
    name: string,
    statusCode = httpStatusCodes.NOT_FOUND,
    description = "Not found.",
    isOperational = true
  ) {
    super(name, statusCode, description, isOperational);
  }
}
