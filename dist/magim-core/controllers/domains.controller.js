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
exports.retrieveMaps = exports.runWorkflow = exports.retrieveDomains = exports.createDomain = void 0;
const base_error_error_1 = __importDefault(require("../../lib/errors/base-error.error"));
const async_handler_middleware_1 = __importDefault(require("../middleware/async-handler.middleware"));
const domainService = __importStar(require("../services/domains.service"));
const createDomain = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let domain;
    const domainDto = req.body;
    const user = req.user;
    if (user) {
        domain = yield domainService.createDomain({
            user: user,
            domain: domainDto.payload,
            teamId: domainDto.teamId,
        });
    }
    if (domain instanceof base_error_error_1.default) {
        return next(domain);
    }
    res.status(200).json({
        success: true,
        data: domain,
    });
}));
exports.createDomain = createDomain;
const retrieveDomains = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    let domains;
    if (user) {
        domains = yield domainService.retrieveDomains({ user: user });
    }
    if (domains instanceof base_error_error_1.default) {
        return next(domains);
    }
    res.status(200).json({
        success: true,
        data: domains,
    });
}));
exports.retrieveDomains = retrieveDomains;
const runWorkflow = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const versionDto = req.body;
    let run;
    if (versionDto) {
        run = yield domainService.runWorkflow({
            version: versionDto,
        });
    }
    if (run instanceof base_error_error_1.default) {
        return next(run);
    }
    res.status(200).json({
        success: true,
        data: "Workflow ran successfully",
    });
}));
exports.runWorkflow = runWorkflow;
const retrieveMaps = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    const domainId = req.params["domainId"];
    const maps = yield domainService.retrieveMaps({
        domainId: domainId,
        user: user,
    });
    if (maps instanceof base_error_error_1.default) {
        return next(maps);
    }
    res.status(201).json({
        success: true,
        data: maps,
    });
}));
exports.retrieveMaps = retrieveMaps;
