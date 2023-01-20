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
const auth_app_1 = require("@octokit/auth-app");
const client_1 = require("@prisma/client");
const axios_1 = __importStar(require("axios"));
const api_403_error_1 = __importDefault(require("../../lib/errors/api-403.error"));
const api_404_error_1 = __importDefault(require("../../lib/errors/api-404.error"));
const api_500_error_1 = __importDefault(require("../../lib/errors/api-500.error"));
const base_error_error_1 = __importDefault(require("../../lib/errors/base-error.error"));
const eventService = __importStar(require("../services/events.service"));
const app_constant_1 = require("../../lib/constants/app.constant");
const config_1 = __importDefault(require("../config/config"));
const prisma = new client_1.PrismaClient();
const CONFIG = config_1.default.getInstance().config;
const createDomain = ({ user, domain, teamId, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const team = yield prisma.userTeam.findFirst({
            where: {
                userId: user.id,
                teamId: teamId,
            },
        });
        if (!team) {
            return new api_403_error_1.default("User does not have access to this team.");
        }
        const newDomain = yield prisma.domain.create({
            data: {
                name: domain.name,
                repository: domain.repository,
                directory: domain.directory,
                ownerId: user.id,
            },
        });
        yield prisma.teamDomain.create({
            data: {
                domainId: newDomain.id,
                teamId: teamId,
            },
        });
        return newDomain;
    }
    catch (err) {
        return new api_500_error_1.default("Failed to create domain.");
    }
});
exports.createDomain = createDomain;
const retrieveDomains = ({ user, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let teamDomains = [];
        const teams = yield prisma.userTeam.findMany({
            where: {
                userId: user.id,
            },
        });
        if (teams.length <= 0) {
            return new api_404_error_1.default("User does not belong to any team.");
        }
        for (let i = 0; i < teams.length; i++) {
            const td = yield prisma.teamDomain.findMany({
                where: {
                    teamId: teams[i].teamId,
                },
                include: {
                    domain: true,
                },
            });
            if (td.length > 0) {
                teamDomains.push(td);
            }
        }
        return teamDomains.flat(1);
    }
    catch (err) {
        return new api_500_error_1.default("Failed to retrieve domains.");
    }
});
exports.retrieveDomains = retrieveDomains;
const runWorkflow = ({ version, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const auth = (0, auth_app_1.createAppAuth)({
            appId: CONFIG.GITHUB.APP_ID,
            privateKey: CONFIG.GITHUB.APP_SECRET,
            clientId: CONFIG.GITHUB.CLIENT_ID,
            clientSecret: CONFIG.GITHUB.CLIENT_SECRET,
        });
        const appAuthentication = yield auth({
            type: "app",
        });
        const installations = yield axios_1.default.get("https://api.github.com/app/installations", {
            headers: {
                Authorization: `Bearer ${appAuthentication.token}`,
            },
        });
        if (installations instanceof axios_1.AxiosError) {
            throw installations;
        }
        let installation = installations.data.find((item) => item.account.login === version.owner);
        const installed = yield isMagimInstalled({
            owner: version.owner,
            repository: version.repository,
        });
        if (installed === true) {
            yield reRunWorkflow({
                owner: version.owner,
                repository: version.repository,
                installationId: installation.id.toString(),
            });
            return;
        }
        let event = yield eventService.installDependencyMapAction({
            installationId: installation.id.toString(),
            branch: "master",
            owner: version.owner,
            reference: `refs/heads/${app_constant_1.MAGIM_MANAGED}`,
            repository: version.repository,
        });
        if (event instanceof base_error_error_1.default) {
            throw event;
        }
    }
    catch (err) {
        return new api_500_error_1.default(`Failed to run workflow.`);
    }
});
exports.runWorkflow = runWorkflow;
const isMagimInstalled = ({ owner, repository, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let domain = yield prisma.domain.findFirst({
            where: {
                repository: `${owner}/${repository}`,
            },
        });
        if (domain === null) {
            return false;
        }
        let map = yield prisma.map.findFirst({
            where: {
                domainId: domain.id,
            },
        });
        if (map === null) {
            return false;
        }
        return true;
    }
    catch (err) {
        return new api_500_error_1.default("Failed to check if Magim is installed.");
    }
});
const retrieveLastCommitFromBranch = ({ owner, repo, branch, token, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const commit = yield axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (commit.status !== 200) {
            throw commit;
        }
        return commit;
    }
    catch (err) {
        return new api_500_error_1.default("Failed to retrieve last commit from branch.");
    }
});
const reRunWorkflow = ({ owner, repository, installationId, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const auth = (0, auth_app_1.createAppAuth)({
            appId: CONFIG.GITHUB.APP_ID,
            privateKey: CONFIG.GITHUB.APP_SECRET,
            installationId: installationId,
            clientId: CONFIG.GITHUB.CLIENT_ID,
            clientSecret: CONFIG.GITHUB.CLIENT_SECRET,
        });
        const appAuthentication = yield auth({
            type: "installation",
            installationId: installationId,
        });
        const { token } = appAuthentication;
        const workflows = yield axios_1.default.get(`https://api.github.com/repos/${owner}/${repository}/actions/workflows`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (workflows instanceof axios_1.AxiosError) {
            throw workflows;
        }
        let workflow = workflows.data.workflows.find((item) => item.path === ".github/workflows/magim-dependencymap.yml");
        const rerun = yield axios_1.default.post(`https://api.github.com/repos/${owner}/${repository}/actions/workflows/${workflow.id}/dispatches`, {
            ref: `${app_constant_1.MAGIM_MANAGED}`,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (rerun instanceof axios_1.AxiosError) {
            throw rerun;
        }
    }
    catch (err) {
        return new api_500_error_1.default("Failed to re-run workflow.");
    }
});
const retrieveMaps = ({ user, domainId, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const team = yield prisma.teamDomain.findFirst({
            where: {
                domainId: domainId,
            },
        });
        if (team === null) {
            throw new api_404_error_1.default("Domain does not exist.");
        }
        const isInTeam = yield prisma.userTeam.findFirst({
            where: {
                teamId: team === null || team === void 0 ? void 0 : team.teamId,
                userId: user.id,
            },
        });
        if (isInTeam === null) {
            throw new api_403_error_1.default("User does not have access to this domain's resources. Reason: user does not belong to the assigned teams.");
        }
        const maps = yield prisma.map.findMany({
            where: {
                domainId: domainId,
            },
        });
        if (maps === null) {
            throw new api_404_error_1.default("Map does not exist.");
        }
        return maps;
    }
    catch (err) {
        return new api_500_error_1.default("Failed to retrieve maps.");
    }
});
exports.retrieveMaps = retrieveMaps;
