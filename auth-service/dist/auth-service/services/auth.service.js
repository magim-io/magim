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
exports.loginWithGithub = exports.retrieveGithubUser = void 0;
const config_1 = __importDefault(require("../config/config"));
const axios_1 = __importDefault(require("axios"));
const query_string_1 = __importDefault(require("query-string"));
const api_500_error_1 = __importDefault(require("../../lib/errors/api-500.error"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const retrieveGithubUser = ({ code, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const githubToken = yield axios_1.default.post(`https://github.com/login/oauth/access_token?client_id=${config_1.default.GITHUB.CLIENT_ID}&client_secret=${config_1.default.GITHUB.CLIENT_SECRET}&code=${code}`);
        const decoded = query_string_1.default.parse(githubToken.data);
        const accessToken = decoded.access_token;
        const user = yield axios_1.default.get("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return user.data;
    }
    catch (err) {
        throw new api_500_error_1.default("Failed to retrieve user info from Github");
    }
});
exports.retrieveGithubUser = retrieveGithubUser;
const loginWithGithub = ({ user, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, avatar_url, bio, email, location, login } = user;
        const extUser = yield prisma.user.findFirst({
            where: {
                email: email,
            },
        });
        if (user === null) {
            const newUser = yield prisma.user.create({
                data: {
                    name: name,
                    avatarUrl: avatar_url,
                    bio: bio,
                    email: email,
                    location: location,
                    login: login,
                },
            });
            return newUser;
        }
        return extUser;
    }
    catch (err) {
        throw new api_500_error_1.default("Failed to login user");
    }
});
exports.loginWithGithub = loginWithGithub;
