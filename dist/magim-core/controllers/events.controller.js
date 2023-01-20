"use strict";
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
const async_handler_middleware_1 = __importDefault(require("../middleware/async-handler.middleware"));
const eventsHandler = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const event = req.headers["x-github-event"];
    // switch (event) {
    //   // case INSTALLATION:
    //   //   handleDependencyMapWorkflowInstallation(req, res, next);
    //   //   break;
    //   // case WORKFLOW_RUN:
    //   //   handleWorkflowRun(req, res, next);
    //   //   break;
    //   // case MAGIM_DEPENDENCYMAP:
    //   //   handleDependencyMap(req, res, next);
    //   //   break;
    //   default:
    //     next(new Api500Error("Unhandled event"));
    //     break;
    // }
}));
exports.eventsHandler = eventsHandler;
