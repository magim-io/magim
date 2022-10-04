import {
  Organization,
  OwnerOrganization,
  PrismaClient,
  User,
} from "@prisma/client";
import ErrorResponse from "../../common/exceptions/error-response.exception";

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

export { createOrg, retrieveOrg, retrieveOrgs, deleteOrg };
