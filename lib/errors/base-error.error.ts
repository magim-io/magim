export default class BaseError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(
    name: string,
    statusCode: number,
    description: string,
    isOperational: boolean
  ) {
    super(description);

    Object.setPrototypeOf(this, new.target.prototype);

    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    // if (Error.captureStackTrace) {
    //   Error.captureStackTrace(this);
    // }
  }
}
