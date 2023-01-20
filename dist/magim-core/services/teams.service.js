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
exports.retrieveTeams = exports.joinTeam = exports.createTeam = void 0;
const client_1 = require("@prisma/client");
const api_403_error_1 = __importDefault(require("../../lib/errors/api-403.error"));
const api_404_error_1 = __importDefault(require("../../lib/errors/api-404.error"));
const api_500_error_1 = __importDefault(require("../../lib/errors/api-500.error"));
const prisma = new client_1.PrismaClient();
const createTeam = ({ team, user, organizationId, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let org;
        let newTeam;
        org = prisma.userOrganization.findMany({
            where: {
                userId: user.id,
                organizationId: organizationId,
            },
        });
        if (!org) {
            return new api_403_error_1.default("User does not have access to this route.");
        }
        newTeam = yield prisma.team.create({
            data: team,
        });
        yield prisma.teamOrganization.create({
            data: {
                teamId: newTeam.id,
                organizationId: organizationId,
            },
        });
        return newTeam;
    }
    catch (err) {
        return new api_500_error_1.default("Failed to create new team.");
    }
});
exports.createTeam = createTeam;
const retrieveTeams = ({ organizationId, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const teams = yield prisma.teamOrganization.findMany({
            where: {
                organizationId: organizationId,
            },
            include: {
                team: true,
            },
        });
        if (teams === null) {
            throw new api_404_error_1.default("Organization does not have any teams.");
        }
        return teams;
    }
    catch (err) {
        return err;
    }
});
exports.retrieveTeams = retrieveTeams;
const joinTeam = ({ user, teamId, organizationId, }) => __awaiter(void 0, void 0, void 0, function* () {
    let team;
    try {
        const org = yield prisma.userOrganization.findFirst({
            where: {
                userId: user.id,
                organizationId: organizationId,
            },
        });
        if (!org) {
            return new api_403_error_1.default("User does not have access to this route.");
        }
        team = yield prisma.userTeam.create({
            data: {
                teamId: teamId,
                userId: user.id,
            },
        });
        return team;
    }
    catch (err) {
        return new api_500_error_1.default("Failed to join team.");
    }
});
exports.joinTeam = joinTeam;
