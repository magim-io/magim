import { PrismaClient, Team, User, UserTeam } from "@prisma/client";
import ErrorResponse from "../../common/exceptions/error-response.exception";

const prisma = new PrismaClient();

const createTeam = async ({
  team,
  user,
  organizationId,
  isOwner,
}: {
  team: Team;
  user: User;
  organizationId: string;
  isOwner: boolean;
}): Promise<Team> => {
  try {
    let org;
    let newTeam;

    switch (isOwner) {
      case true:
        org = prisma.ownerOrganization.findMany({
          where: {
            ownerId: user.id,
          },
          include: {
            organization: true,
          },
        });
        break;

      case false:
        org = prisma.userOrganization.findMany({
          where: {
            userId: user.id,
          },
          include: {
            organization: true,
          },
        });
        break;
    }

    if (!org) {
      throw new ErrorResponse("User does not have access to this route", 403);
    }

    newTeam = await prisma.team.create({
      data: team,
    });

    await prisma.teamOrganization.create({
      data: {
        teamId: newTeam.id,
        organizationId: organizationId,
      },
    });

    return newTeam;
  } catch (err) {
    throw new ErrorResponse("Fail to create new team", 500);
  }
};

const joinTeam = async ({
  user,
  teamId,
  organizationId,
}: {
  user: User;
  teamId: string;
  organizationId: string;
}): Promise<UserTeam> => {
  let team;
  try {
    const org = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: organizationId,
      },
    });

    if (!org) {
      throw new ErrorResponse("User does not have access to this route", 403);
    }

    team = await prisma.userTeam.create({
      data: {
        teamId: teamId,
        userId: user.id,
      },
    });

    return team;
  } catch (err) {
    throw new ErrorResponse("Fail to join team", 500);
  }
};

export { createTeam, joinTeam };
