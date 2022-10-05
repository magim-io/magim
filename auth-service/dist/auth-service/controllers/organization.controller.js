"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinOrg = exports.inviteMember = exports.deleteOrg = exports.retrieveOrgs = exports.retrieveOrg = exports.createOrg = void 0;
const lodash_1 = require("lodash");
const async_handler_middleware_1 = __importDefault(require("../middleware/async-handler.middleware"));
const orgService = __importStar(require("../services/organization.service"));
const createOrg = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const orgDto = req.body;
    let org;
    if (req.user) {
        org = yield orgService.createOrg({
            organization: orgDto,
            owner: req.user,
        });
    }
    res.status(201).json({
        success: true,
        data: org,
    });
}));
exports.createOrg = createOrg;
const retrieveOrg = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const orgId = req.params["orgId"];
    let org;
    if (user && orgId) {
        const type = user.type;
        switch (type) {
            case "MEMBER":
                org = yield orgService.retrieveOrg({
                    user: user,
                    isOwner: false,
                    organizationId: orgId,
                });
                break;
            case "OWNER":
                org = yield orgService.retrieveOrg({
                    user: user,
                    isOwner: true,
                    organizationId: orgId,
                });
                break;
        }
    }
    res.status(200).json({
        success: true,
        data: org,
    });
}));
exports.retrieveOrg = retrieveOrg;
const retrieveOrgs = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    let orgs;
    if (user) {
        const type = user.type;
        switch (type) {
            case "MEMBER":
                orgs = yield orgService.retrieveOrgs({ user: user, isOwner: false });
                break;
            case "OWNER":
                orgs = yield orgService.retrieveOrgs({ user: user, isOwner: true });
                break;
        }
    }
    res.status(200).json({
        success: true,
        data: orgs,
    });
}));
exports.retrieveOrgs = retrieveOrgs;
const deleteOrg = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const owner = req.user;
    const orgId = req.params["orgId"];
    let org;
    if (owner && orgId) {
        org = yield orgService.deleteOrg({ organizationId: orgId, owner: owner });
    }
    res.status(204).json({
        success: true,
        data: org,
    });
}));
exports.deleteOrg = deleteOrg;
const inviteMember = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const memberEmail = req.body["memberEmail"];
    const orgId = req.body["organizationId"];
    const user = req.user;
    let member;
    if (user && memberEmail && orgId) {
        const type = user.type;
        switch (type) {
            case "MEMBER":
                member = yield orgService.inviteMember({
                    user: user,
                    memberEmail: memberEmail,
                    organizationId: orgId,
                    isOwner: false,
                });
                break;
            case "OWNER":
                member = yield orgService.inviteMember({
                    user: user,
                    memberEmail: memberEmail,
                    organizationId: orgId,
                    isOwner: true,
                });
                break;
        }
    }
    res.status(201).json({ success: true, data: member });
}));
exports.inviteMember = inviteMember;
const joinOrg = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const invId = (0, lodash_1.get)(req, "query.inv");
    const orgId = (0, lodash_1.get)(req, "query.org");
    let joinedOrg;
    if (user && invId && orgId) {
        joinedOrg = yield orgService.joinOrg({
            inviatationId: invId,
            user: user,
            organizationId: orgId,
        });
    }
    res.status(201).json({
        success: true,
        data: joinedOrg,
    });
}));
exports.joinOrg = joinOrg;
