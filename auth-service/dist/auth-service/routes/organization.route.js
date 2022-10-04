"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const organization_controller_1 = require("../controllers/organization.controller");
const role_guard_middleware_1 = __importDefault(require("../middleware/role-guard.middleware"));
const route_guard_middleware_1 = __importDefault(require("../middleware/route-guard.middleware"));
const orgRouter = express_1.default.Router();
orgRouter
    .route("/:orgId")
    .get(route_guard_middleware_1.default, (0, role_guard_middleware_1.default)("MEMBER", "OWNER"), organization_controller_1.retrieveOrg)
    .delete(route_guard_middleware_1.default, (0, role_guard_middleware_1.default)("MEMBER", "OWNER"), organization_controller_1.deleteOrg);
orgRouter
    .route("/")
    .get(route_guard_middleware_1.default, (0, role_guard_middleware_1.default)("MEMBER", "OWNER"), organization_controller_1.retrieveOrgs)
    .post(route_guard_middleware_1.default, (0, role_guard_middleware_1.default)("OWNER"), organization_controller_1.createOrg);
exports.default = orgRouter;
