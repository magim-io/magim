"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const teams_controller_1 = require("../controllers/teams.controller");
const route_guard_middleware_1 = __importDefault(require("../middleware/route-guard.middleware"));
const teamRouter = express_1.default.Router();
teamRouter.route("/").post(route_guard_middleware_1.default, teams_controller_1.createTeam);
teamRouter.route("/members/join").post(route_guard_middleware_1.default, teams_controller_1.joinTeam);
exports.default = teamRouter;
