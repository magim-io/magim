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
exports.loginWithGithub = void 0;
const error_response_exception_1 = __importDefault(require("../../common/exceptions/error-response.exception"));
const async_handler_middleware_1 = __importDefault(require("../middleware/async-handler.middleware"));
const auth_service_1 = require("../services/auth.service");
const lodash_1 = require("lodash");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
const loginWithGithub = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const code = (0, lodash_1.get)(req, "query.code");
    const path = (0, lodash_1.get)(req, "query.path", "/");
    if (!code) {
        return next(new error_response_exception_1.default("Github code is missing", 401));
    }
    const githubUser = yield (0, auth_service_1.retrieveGithubUser)({ code });
    // @todo: check and register user
    if (!!config_1.default.SERVER.JWT_SECRET) {
        const token = jsonwebtoken_1.default.sign(githubUser, config_1.default.SERVER.JWT_SECRET);
        res.cookie(config_1.default.SERVER.COOKIE_NAME, token, {
            httpOnly: true,
            domain: `localhost`,
        });
    }
    res.redirect(`http://localhost:${config_1.default.WEB.PORT}`);
}));
exports.loginWithGithub = loginWithGithub;
