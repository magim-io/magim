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
exports.eventsHandler = void 0;
const base_error_error_1 = __importDefault(require("../../lib/errors/base-error.error"));
const async_handler_middleware_1 = __importDefault(require("../middleware/async-handler.middleware"));
const eventService = __importStar(require("../services/events.service"));
const events_1 = require("../../lib/constants/events");
const actions_1 = require("../../lib/constants/actions");
const api_500_error_1 = __importDefault(require("../../lib/errors/api-500.error"));
const eventsHandler = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const event = req.headers["x-github-event"];
    switch (event) {
        case events_1.INSTALLATION:
            handleDependencyMapWorkflowInstallation(req, res, next);
            break;
        // case WORKFLOW_RUN:
        //   handleWorkflowRun(req, res, next);
        //   break;
        // case MAGIM_DEPENDENCYMAP:
        //   handleDependencyMap(req, res, next);
        //   break;
        default:
            next(new api_500_error_1.default("Unhandled event"));
            break;
    }
}));
exports.eventsHandler = eventsHandler;
const handleDependencyMapWorkflowInstallation = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const installationId = req.body.installation.id;
    const action = req.body.action;
    let event;
    if (action === actions_1.CREATED) {
        event = yield eventService.installDependencyMapAction({
            installationId: installationId,
            branch: "main",
            owner: "magim-io",
            reference: "refs/heads/magim-managed-branch",
            repository: "hunterrank",
        });
    }
    if (event instanceof base_error_error_1.default) {
        return next(event);
    }
    res.status(200).json({
        success: true,
        data: "Magim Github App installed successfully",
    });
}));
