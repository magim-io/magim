import BaseError from "./base-error.error";
import httpStatusCodes from "./http-status-codes.constant";

export default class Api500Error extends BaseError {
  constructor(
    name: string,
    statusCode = httpStatusCodes.INTERNAL_SERVER,
    description = "Server error.",
    isOperational = true
  ) {
    super(name, statusCode, description, isOperational);
  }
}
