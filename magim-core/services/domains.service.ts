import {
  PrismaClient,
  Team,
  User,
  UserTeam,
  Domain,
  TeamDomain,
} from "@prisma/client";
import Api403Error from "../../lib/errors/api-403.error";
import Api404Error from "../../lib/errors/api-404.error";
import Api500Error from "../../lib/errors/api-500.error";
import BaseError from "../../lib/errors/base-error.error";

const prisma = new PrismaClient();

const createDomain = async ({
  user,
  domain,
  teamId,
}: {
  user: User;
  domain: { name: string; repository: string; directory: string };
  teamId: string;
}): Promise<Domain | BaseError> => {
  try {
    const team = await prisma.userTeam.findFirst({
      where: {
        userId: user.id,
        teamId: teamId,
      },
    });

    if (!team) {
      return new Api403Error("User does not have access to this team");
    }

    const newDomain = await prisma.domain.create({
      data: {
        name: domain.name,
        repository: domain.repository,
        directory: domain.directory,
        ownerId: user.id,
      },
    });

    await prisma.teamDomain.create({
      data: {
        domainId: newDomain.id,
        teamId: teamId,
      },
    });

    return newDomain;
  } catch (err) {
    return new Api500Error("Fail to create domain");
  }
};

const retrieveDomains = async ({
  user,
}: {
  user: User;
}): Promise<TeamDomain[] | BaseError> => {
  try {
    let teamDomains = [];

    const teams = await prisma.userTeam.findMany({
      where: {
        userId: user.id,
      },
    });

    if (teams.length <= 0) {
      return new Api404Error("User does not belong to any team");
    }

    for (let i = 0; i < teams.length; i++) {
      const td = await prisma.teamDomain.findMany({
        where: {
          teamId: teams[i].teamId,
        },
        include: {
          domain: true,
        },
      });
      if (td.length > 0) {
        teamDomains.push(td);
      }
    }

    return teamDomains.flat(1);
  } catch (err) {
    return new Api500Error("Fail to retrieve domains");
  }
};

export { createDomain, retrieveDomains };
