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
exports.createDomain = void 0;
const client_1 = require("@prisma/client");
const error_response_exception_1 = __importDefault(require("../../common/exceptions/error-response.exception"));
const prisma = new client_1.PrismaClient();
const createDomain = ({ user, domain, teamId, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const newDomain = yield prisma.domain.create({
            data: {
                name: domain.name,
                ownerId: user.id,
            },
        });
        const team = yield prisma.userTeam.findFirst({
            where: {
                userId: user.id,
                teamId: teamId,
            },
        });
        if (!team) {
            throw new error_response_exception_1.default("User does not have access to this team", 403);
        }
        yield prisma.teamDomain.create({
            data: {
                domainId: newDomain.id,
                teamId: teamId,
            },
        });
        return newDomain;
    }
    catch (err) {
        throw new error_response_exception_1.default("Fail to create domain", 500);
    }
});
exports.createDomain = createDomain;
