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
exports.deleteOrg = exports.retrieveOrgs = exports.retrieveOrg = exports.createOrg = void 0;
const client_1 = require("@prisma/client");
const error_response_exception_1 = __importDefault(require("../../common/exceptions/error-response.exception"));
const prisma = new client_1.PrismaClient();
const createOrg = ({ organization, owner, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const org = yield prisma.organization.create({
            data: organization,
        });
        yield prisma.ownerOrganization.create({
            data: {
                organizationId: org.id,
                ownerId: owner.id,
            },
        });
        return org;
    }
    catch (err) {
        throw new error_response_exception_1.default("Fail to create new organization", 500);
    }
});
exports.createOrg = createOrg;
const retrieveOrg = ({ user, isOwner, organizationId, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let orgs;
        switch (isOwner) {
            case true:
                orgs = prisma.ownerOrganization.findFirst({
                    where: {
                        organizationId: organizationId,
                    },
                    include: {
                        organization: true,
                    },
                });
                break;
            case false:
                orgs = prisma.userOrganization.findFirst({
                    where: {
                        organizationId: organizationId,
                    },
                    include: {
                        organization: true,
                    },
                });
                break;
        }
        return orgs;
    }
    catch (err) {
        throw new error_response_exception_1.default("Fail to retrieve organizations", 500);
    }
});
exports.retrieveOrg = retrieveOrg;
const retrieveOrgs = ({ user, isOwner, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let orgs;
        switch (isOwner) {
            case true:
                orgs = prisma.ownerOrganization.findMany({
                    where: {
                        ownerId: user.id,
                    },
                    include: {
                        organization: true,
                    },
                });
                break;
            case false:
                orgs = prisma.userOrganization.findMany({
                    where: {
                        userId: user.id,
                    },
                    include: {
                        organization: true,
                    },
                });
                break;
        }
        return orgs;
    }
    catch (err) {
        throw new error_response_exception_1.default("Fail to retrieve organizations", 500);
    }
});
exports.retrieveOrgs = retrieveOrgs;
const deleteOrg = ({ organizationId, owner, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let org;
        org = yield prisma.ownerOrganization.findFirst({
            where: {
                organizationId: organizationId,
                ownerId: owner.id,
            },
        });
        if (!org) {
            throw new error_response_exception_1.default("Fail to find organization with this id", 404);
        }
        console.log("org", org);
        return yield prisma.organization.delete({
            where: {
                id: organizationId,
            },
        });
    }
    catch (err) {
        throw new error_response_exception_1.default("Fail to delete organization", 500);
    }
});
exports.deleteOrg = deleteOrg;
