"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const api_403_error_1 = __importDefault(require("../../lib/errors/api-403.error"));
const roleGuard = (...roles) => {
    return (req, res, next) => {
        if (req.user !== undefined) {
            if (!roles.includes(req.user.type)) {
                return next(new api_403_error_1.default(`User role ${req.user.type} is not authorized to access this route`));
            }
        }
        next();
    };
};
exports.default = roleGuard;
