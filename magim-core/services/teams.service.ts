import { PrismaClient, Team, User, UserTeam } from "@prisma/client";
import Api403Error from "../../lib/errors/api-403.error";
import Api404Error from "../../lib/errors/api-404.error";
import Api500Error from "../../lib/errors/api-500.error";
import BaseError from "../../lib/errors/base-error.error";

const prisma = new PrismaClient();

const createTeam = async ({
  team,
  user,
  organizationId,
}: {
  team: Team;
  user: User;
  organizationId: string;
}): Promise<Team | BaseError> => {
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
      return new Api403Error("User does not have access to this route.");
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
    return new Api500Error("Failed to create new team.");
  }
};

const retrieveTeams = async ({
  organizationId,
}: {
  organizationId: string;
}) => {
  try {
    const teams = await prisma.teamOrganization.findMany({
      where: {
        organizationId: organizationId,
      },
      include: {
        team: true,
      },
    });

    if (teams === null) {
      throw new Api404Error("Organization does not have any teams.");
    }

    return teams;
  } catch (err) {
    return err;
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
}): Promise<UserTeam | BaseError> => {
  let team;
  try {
    const org = await prisma.userOrganization.findFirst({
      where: {
        userId: user.id,
        organizationId: organizationId,
      },
    });

    if (!org) {
      return new Api403Error("User does not have access to this route.");
    }

    team = await prisma.userTeam.create({
      data: {
        teamId: teamId,
        userId: user.id,
      },
    });

    return team;
  } catch (err) {
    return new Api500Error("Failed to join team.");
  }
};

export { createTeam, joinTeam, retrieveTeams };
