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
exports.retrieveDomains = exports.createDomain = void 0;
const client_1 = require("@prisma/client");
const api_403_error_1 = __importDefault(require("../../lib/errors/api-403.error"));
const api_404_error_1 = __importDefault(require("../../lib/errors/api-404.error"));
const api_500_error_1 = __importDefault(require("../../lib/errors/api-500.error"));
const prisma = new client_1.PrismaClient();
const createDomain = ({ user, domain, teamId, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const team = yield prisma.userTeam.findFirst({
            where: {
                userId: user.id,
                teamId: teamId,
            },
        });
        if (!team) {
            return new api_403_error_1.default("User does not have access to this team");
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
        return new api_500_error_1.default("Fail to create domain");
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
            return new api_404_error_1.default("User does not belong to any team");
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
        return new api_500_error_1.default("Fail to retrieve domains");
    }
});
exports.retrieveDomains = retrieveDomains;
