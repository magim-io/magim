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
exports.joinOrg = exports.inviteMember = exports.deleteOrg = exports.retrieveOrgs = exports.retrieveOrg = exports.createOrg = void 0;
const client_1 = require("@prisma/client");
const api_500_error_1 = __importDefault(require("../../lib/errors/api-500.error"));
const api_404_error_1 = __importDefault(require("../../lib/errors/api-404.error"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const api_403_error_1 = __importDefault(require("../../lib/errors/api-403.error"));
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
        yield prisma.userOrganization.create({
            data: {
                organizationId: org.id,
                userId: owner.id,
            },
        });
        return org;
    }
    catch (err) {
        return new api_500_error_1.default("Fail to create new organization");
    }
});
exports.createOrg = createOrg;
const retrieveOrg = ({ user, organizationId, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let orgs;
        orgs = prisma.userOrganization.findFirst({
            where: {
                organizationId: organizationId,
            },
            include: {
                organization: true,
            },
        });
        return orgs;
    }
    catch (err) {
        return new api_500_error_1.default("Fail to retrieve organizations");
    }
});
exports.retrieveOrg = retrieveOrg;
const retrieveOrgs = ({ user }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let orgs;
        orgs = prisma.userOrganization.findMany({
            where: {
                userId: user.id,
            },
            include: {
                organization: true,
            },
        });
        return orgs;
    }
    catch (err) {
        return new api_500_error_1.default("Fail to retrieve organizations");
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
            return new api_404_error_1.default("Fail to find organization with this id");
        }
        yield prisma.organization.delete({
            where: {
                id: organizationId,
            },
        });
    }
    catch (err) {
        return new api_500_error_1.default("Fail to delete organization");
    }
});
exports.deleteOrg = deleteOrg;
const inviteMember = ({ user, memberEmail, organizationId, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let inviterOrg;
        let newMember;
        inviterOrg = yield prisma.userOrganization.findFirst({
            where: {
                userId: user.id,
                organizationId: organizationId,
            },
        });
        if (!inviterOrg) {
            return new api_403_error_1.default("Inviter does not belong to the organization");
        }
        newMember = yield prisma.user.findFirst({
            where: {
                email: memberEmail,
            },
        });
        if (!newMember) {
            return new api_404_error_1.default("Fail to find member to invite");
        }
        const inviatation = yield prisma.organizationInviatation.create({
            data: {
                userId: newMember.id,
                organizationId: organizationId,
            },
        });
        if (inviatation) {
            sendEmail();
        }
        return inviatation;
    }
    catch (err) {
        return new api_500_error_1.default("Fail to invite member to organization");
    }
});
exports.inviteMember = inviteMember;
const joinOrg = ({ user, organizationId, inviatationId, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const inviatation = yield prisma.organizationInviatation.findFirst({
            where: {
                id: inviatationId,
                // userId: user.id
            },
        });
        if (!inviatation) {
            return new api_404_error_1.default("You have not been invited to join the organization");
        }
        yield prisma.organizationInviatation.delete({
            where: {
                id: inviatation.id,
            },
        });
        return yield prisma.userOrganization.create({
            data: {
                organizationId: organizationId,
                userId: user.id,
            },
        });
    }
    catch (err) {
        return new api_500_error_1.default("Fail to join organization");
    }
});
exports.joinOrg = joinOrg;
const sendEmail = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        let testAccount = yield nodemailer_1.default.createTestAccount();
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer_1.default.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass, // generated ethereal password
            },
        });
        // send mail with defined transport object
        let info = yield transporter.sendMail({
            from: '"Fred Foo 👻" <foo@example.com>',
            to: "quachhengtony@gmail.com",
            subject: "You have been invited to join an organization",
            text: "Link to join: http://localhost:5000/api/v1/organizations/members/join", // plain text body
            // html: "<b>Hello world?</b>", // html body
        });
        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer_1.default.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    }
    catch (err) {
        return new api_500_error_1.default("Fail to send inviatation via email");
    }
});
