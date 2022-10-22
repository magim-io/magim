"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const options = {
    console: {
        level: "debug",
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};
const logger = winston_1.default.createLogger({
    levels: winston_1.default.config.npm.levels,
    transports: [new winston_1.default.transports.Console(options.console)],
    exitOnError: false,
});
exports.default = logger;
