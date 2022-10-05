import {
  Organization,
  OwnerOrganization,
  PrismaClient,
  User,
} from "@prisma/client";
import ErrorResponse from "../../common/exceptions/error-response.exception";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const createOrg = async ({
  organization,
  owner,
}: {
  organization: Organization;
  owner: User;
}): Promise<Organization> => {
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

    return org;
  } catch (err) {
    throw new ErrorResponse("Fail to create new organization", 500);
  }
};

const retrieveOrg = async ({
  user,
  isOwner,
  organizationId,
}: {
  user: User;
  isOwner: boolean;
  organizationId: string;
}): Promise<any> => {
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
  } catch (err) {
    throw new ErrorResponse("Fail to retrieve organizations", 500);
  }
};

const retrieveOrgs = async ({
  user,
  isOwner,
}: {
  user: User;
  isOwner: boolean;
}): Promise<any> => {
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
  } catch (err) {
    throw new ErrorResponse("Fail to retrieve organizations", 500);
  }
};

const deleteOrg = async ({
  organizationId,
  owner,
}: {
  organizationId: string;
  owner: User;
}): Promise<any> => {
  try {
    let org;

    org = await prisma.ownerOrganization.findFirst({
      where: {
        organizationId: organizationId,
        ownerId: owner.id,
      },
    });

    if (!org) {
      throw new ErrorResponse("Fail to find organization with this id", 404);
    }

    console.log("org", org);
    return await prisma.organization.delete({
      where: {
        id: organizationId,
      },
    });
  } catch (err) {
    throw new ErrorResponse("Fail to delete organization", 500);
  }
};

const inviteMember = async ({
  user,
  memberEmail,
  organizationId,
  isOwner,
}: {
  user: User;
  memberEmail: string;
  organizationId: string;
  isOwner: boolean;
}): Promise<any> => {
  try {
    let inviterOrg;
    let newMember;

    switch (isOwner) {
      case true:
        inviterOrg = await prisma.ownerOrganization.findFirst({
          where: {
            ownerId: user.id,
            organizationId: organizationId,
          },
        });

        if (!inviterOrg) {
          throw new ErrorResponse(
            "Inviter does not belong to the organization",
            403
          );
        }

        newMember = await prisma.user.findFirst({
          where: {
            email: memberEmail,
          },
        });

        if (!newMember) {
          throw new ErrorResponse("Fail to find member to invite", 404);
        }

        break;

      case false:
        inviterOrg = await prisma.userOrganization.findFirst({
          where: {
            userId: user.id,
            organizationId: organizationId,
          },
        });

        if (!inviterOrg) {
          throw new ErrorResponse(
            "Inviter does not belong to the organization",
            403
          );
        }

        newMember = await prisma.user.findFirst({
          where: {
            email: memberEmail,
          },
        });

        if (!newMember) {
          throw new ErrorResponse("Fail to find member to invite", 404);
        }

        break;
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

    return newMember;
  } catch (err) {
    throw new ErrorResponse("Fail to invite member to organization", 500);
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
}) => {
  try {
    const inviatation = await prisma.organizationInviatation.findFirst({
      where: {
        id: inviatationId,
      },
    });

    if (!inviatation) {
      throw new ErrorResponse(
        "You have not been invited to join the organization",
        404
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
    throw new ErrorResponse("Fail to join organization", 500);
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
    throw new ErrorResponse("Fail to send inviatation via email", 500);
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
