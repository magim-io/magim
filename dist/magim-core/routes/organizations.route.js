"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const organizations_controller_1 = require("../controllers/organizations.controller");
const role_guard_middleware_1 = __importDefault(require("../middleware/role-guard.middleware"));
const route_guard_middleware_1 = __importDefault(require("../middleware/route-guard.middleware"));
const orgRouter = express_1.default.Router();
orgRouter
    .route("/")
    .get(route_guard_middleware_1.default, (0, role_guard_middleware_1.default)("MEMBER", "OWNER"), organizations_controller_1.retrieveOrgs)
    .post(route_guard_middleware_1.default, (0, role_guard_middleware_1.default)("OWNER"), organizations_controller_1.createOrg);
orgRouter
    .route("/:orgId")
    .get(route_guard_middleware_1.default, (0, role_guard_middleware_1.default)("MEMBER", "OWNER"), organizations_controller_1.retrieveOrg)
    .delete(route_guard_middleware_1.default, (0, role_guard_middleware_1.default)("MEMBER", "OWNER"), organizations_controller_1.deleteOrg);
orgRouter
    .route("/members/invite")
    .post(route_guard_middleware_1.default, (0, role_guard_middleware_1.default)("MEMBER", "OWNER"), organizations_controller_1.inviteMember);
orgRouter.route("/members/join").get(route_guard_middleware_1.default, organizations_controller_1.joinOrg);
exports.default = orgRouter;
