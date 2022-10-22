"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_error_error_1 = __importDefault(require("./base-error.error"));
const http_status_codes_constant_1 = __importDefault(require("./http-status-codes.constant"));
class Api403Error extends base_error_error_1.default {
    constructor(name, statusCode = http_status_codes_constant_1.default.FORBIDDEN, description = "Forbidden", isOperational = true) {
        super(name, statusCode, description, isOperational);
    }
}
exports.default = Api403Error;
