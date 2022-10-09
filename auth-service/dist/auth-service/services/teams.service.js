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
exports.joinTeam = exports.createTeam = void 0;
const client_1 = require("@prisma/client");
const error_response_exception_1 = __importDefault(require("../../common/exceptions/error-response.exception"));
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
            throw new error_response_exception_1.default("User does not have access to this route", 403);
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
        throw new error_response_exception_1.default("Fail to create new team", 500);
    }
});
exports.createTeam = createTeam;
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
            throw new error_response_exception_1.default("User does not have access to this route", 403);
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
        throw new error_response_exception_1.default("Fail to join team", 500);
    }
});
exports.joinTeam = joinTeam;
