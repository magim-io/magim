"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const error_response_exception_1 = __importDefault(require("../../lib/exceptions/error-response.exception"));
const roleGuard = (...roles) => {
    return (req, res, next) => {
        if (req.user !== undefined) {
            if (!roles.includes(req.user.type)) {
                return next(new error_response_exception_1.default(`User role ${req.user.type} is not authorized to access this route`, 403));
            }
        }
        next();
    };
};
exports.default = roleGuard;
