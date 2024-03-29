import {
  Organization,
  OrganizationInviatation,
  OwnerOrganization,
  PrismaClient,
  User,
  UserOrganization,
} from "@prisma/client";
import Api500Error from "../../lib/errors/api-500.error";
import Api404Error from "../../lib/errors/api-404.error";
import nodemailer from "nodemailer";
import Api403Error from "../../lib/errors/api-403.error";
import BaseError from "../../lib/errors/base-error.error";

const prisma = new PrismaClient();

const createOrg = async ({
  organization,
  owner,
}: {
  organization: Organization;
  owner: User;
}): Promise<Organization | BaseError> => {
  try {
    const org: Organization = await prisma.organization.create({
      data: organization,
    });

    await prisma.ownerOrganization.create({
      data: {
        organizationId: org.id,
        ownerId: owner.id,
      },
    });

    await prisma.userOrganization.create({
      data: {
        organizationId: org.id,
        userId: owner.id,
      },
    });

    return org;
  } catch (err) {
    return new Api500Error("Failed to create new organization.");
  }
};

const retrieveOrg = async ({
  user,
  organizationId,
}: {
  user: User;
  organizationId: string;
}): Promise<any> => {
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
  } catch (err) {
    return new Api500Error("Failed to retrieve organizations.");
  }
};

const retrieveOrgs = async ({ user }: { user: User }): Promise<any> => {
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
  } catch (err) {
    return new Api500Error("Failed to retrieve organizations.");
  }
};

const deleteOrg = async ({
  organizationId,
  owner,
}: {
  organizationId: string;
  owner: User;
}): Promise<void | BaseError> => {
  try {
    let org;

    org = await prisma.ownerOrganization.findFirst({
      where: {
        organizationId: organizationId,
        ownerId: owner.id,
      },
    });

    if (!org) {
      return new Api404Error("Failed to find organization with this id.");
    }

    await prisma.organization.delete({
      where: {
        id: organizationId,
      },
    });
  } catch (err) {
    return new Api500Error("Failed to delete organization.");
  }
};

const inviteMember = async ({
  user,
  memberEmail,
  organizationId,
}: {
  user: User;
  memberEmail: string;
  organizationId: string;
}): Promise<OrganizationInviatation | BaseError> => {
  try {
    let inviterOrg;
    let newMember;

    inviterOrg = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: organizationId,
      },
    });

    if (!inviterOrg) {
      return new Api403Error("Inviter does not belong to the organization.");
    }

    newMember = await prisma.user.findFirst({
      where: {
        email: memberEmail,
      },
    });

    if (!newMember) {
      return new Api404Error("Failed to find member to invite.");
    }

    const inviatation = await prisma.organizationInviatation.create({
      data: {
        userId: newMember.id,
        organizationId: organizationId,
      },
    });

    if (inviatation) {
      sendEmail();
    }

    return inviatation;
  } catch (err) {
    return new Api500Error("Failed to invite member to organization.");
  }
};

const joinOrg = async ({
  user,
  organizationId,
  inviatationId,
}: {
  user: User;
  organizationId: string;
  inviatationId: string;
}): Promise<UserOrganization | BaseError> => {
  try {
    const inviatation = await prisma.organizationInviatation.findFirst({
      where: {
        id: inviatationId,
        // userId: user.id
      },
    });

    if (!inviatation) {
      return new Api404Error(
        "You have not been invited to join the organization."
      );
    }

    await prisma.organizationInviatation.delete({
      where: {
        id: inviatation.id,
      },
    });

    return await prisma.userOrganization.create({
      data: {
        organizationId: organizationId,
        userId: user.id,
      },
    });
  } catch (err) {
    return new Api500Error("Failed to join organization");
  }
};

const sendEmail = async () => {
  try {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Fred Foo 👻" <foo@example.com>', // sender address
      to: "quachhengtony@gmail.com", // list of receivers
      subject: "You have been invited to join an organization", // Subject line
      text: "Link to join: http://localhost:5000/api/v1/organizations/members/join", // plain text body
      // html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  } catch (err) {
    return new Api500Error("Failed to send inviatation via email.");
  }
};

export {
  createOrg,
  retrieveOrg,
  retrieveOrgs,
  deleteOrg,
  inviteMember,
  joinOrg,
};
