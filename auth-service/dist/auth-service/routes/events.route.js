"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const events_controller_1 = require("../controllers/events.controller");
const eventRouter = express_1.default.Router();
eventRouter
    .route("/install-dependencymap-action")
    .post(events_controller_1.installDependencyMapAction);
exports.default = eventRouter;
