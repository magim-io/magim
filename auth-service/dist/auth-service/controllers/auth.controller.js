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
exports.loginWithGithub = void 0;
const api_401_error_1 = __importDefault(require("../../lib/errors/api-401.error"));
const async_handler_middleware_1 = __importDefault(require("../middleware/async-handler.middleware"));
const authService = __importStar(require("../services/auth.service"));
const lodash_1 = require("lodash");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
const base_error_error_1 = __importDefault(require("../../lib/errors/base-error.error"));
const loginWithGithub = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const code = (0, lodash_1.get)(req, "query.code");
    const path = (0, lodash_1.get)(req, "query.path", "/");
    if (!code) {
        return next(new api_401_error_1.default("Github code is missing"));
    }
    const githubUser = yield authService.retrieveGithubUser({
        code,
    });
    if (githubUser instanceof base_error_error_1.default) {
        return next(githubUser);
    }
    const user = yield authService.loginWithGithub({
        user: githubUser,
    });
    if (user instanceof base_error_error_1.default) {
        return next(user);
    }
    if (user !== null) {
        if (!!config_1.default.SERVER.JWT_SECRET) {
            const token = jsonwebtoken_1.default.sign(user, config_1.default.SERVER.JWT_SECRET);
            res.cookie(config_1.default.SERVER.COOKIE_NAME, token, {
                // httpOnly: true,
                domain: `localhost`,
            });
        }
    }
    res.redirect(`http://localhost:${config_1.default.WEB.PORT}`);
}));
exports.loginWithGithub = loginWithGithub;
