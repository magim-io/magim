"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const maps_controller_1 = require("../controllers/maps.controller");
const mapRouter = express_1.default.Router();
mapRouter.route("/").post(maps_controller_1.createMap);
exports.default = mapRouter;
