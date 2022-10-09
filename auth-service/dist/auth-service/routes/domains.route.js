"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const domains_controller_1 = require("../controllers/domains.controller");
const route_guard_middleware_1 = __importDefault(require("../middleware/route-guard.middleware"));
const domainRouter = express_1.default.Router();
domainRouter.route("/").post(route_guard_middleware_1.default, domains_controller_1.createDomain);
exports.default = domainRouter;
