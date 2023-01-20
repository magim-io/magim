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
exports.createMap = void 0;
const api_500_error_1 = __importDefault(require("../../lib/errors/api-500.error"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createMap = ({ repository, payload, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const repo = repository.replace(/"/gi, "");
        const domain = yield prisma.domain.findFirst({
            where: {
                repository: repo,
            },
        });
        if (domain === null) {
            return new api_500_error_1.default("Repository does not exist.");
        }
        const map = yield prisma.map.create({
            data: {
                payload: payload,
                type: client_1.MapType.DEPENDENCY,
                domainId: domain.id,
            },
        });
        return map;
    }
    catch (err) {
        return new api_500_error_1.default("Failed to create map.");
    }
});
exports.createMap = createMap;
