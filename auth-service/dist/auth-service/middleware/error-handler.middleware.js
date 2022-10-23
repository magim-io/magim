"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOperationalError = exports.logError = exports.errorHandler = void 0;
const base_error_error_1 = __importDefault(require("../../lib/errors/base-error.error"));
const logger_middleware_1 = __importDefault(require("./logger.middleware"));
const logError = (err) => {
    logger_middleware_1.default.error(err);
};
exports.logError = logError;
const isOperationalError = (err) => {
    if (err instanceof base_error_error_1.default) {
        return err.isOperational;
    }
    return false;
};
exports.isOperationalError = isOperationalError;
const errorHandler = (err, req, res, next) => {
    logger_middleware_1.default.error(err);
    res.status(err.statusCode || 500).json({
        success: false,
        error: err || "Server error",
    });
};
exports.errorHandler = errorHandler;
