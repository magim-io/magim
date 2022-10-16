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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const async_handler_middleware_1 = __importDefault(require("./async-handler.middleware"));
const error_response_exception_1 = __importDefault(require("../../lib/exceptions/error-response.exception"));
const client_1 = require("@prisma/client");
const config_1 = __importDefault(require("../config/config"));
const lodash_1 = require("lodash");
const routeGuard = (0, async_handler_middleware_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    const prisma = new client_1.PrismaClient();
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }
    // if (req.cookies.mgt) {
    //   token = req.cookies.mgt;
    // }
    if (!token) {
        return next(new error_response_exception_1.default("Not authorized to access this route", 401));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, (0, lodash_1.get)(config_1.default, "SERVER.JWT_SECRET"));
        const user = yield prisma.user.findFirst({
            where: {
                id: (0, lodash_1.get)(decoded, "id"),
            },
        });
        if (user === null) {
            return next(new error_response_exception_1.default("Not authorized to access this route", 401));
        }
        req.user = user;
        next();
    }
    catch (err) {
        return next(new error_response_exception_1.default("Not authorized to access this route", 401));
    }
}));
exports.default = routeGuard;
