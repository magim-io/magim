import { PrismaClient, Team, User, UserTeam, Domain } from "@prisma/client";
import Api403Error from "../../lib/errors/api-403.error";
import Api500Error from "../../lib/errors/api-500.error";

const prisma = new PrismaClient();

const createDomain = async ({
  user,
  domain,
  teamId,
}: {
  user: User;
  domain: { name: string; repository: string; directory: string };
  teamId: string;
}): Promise<Domain> => {
  try {
    const newDomain: Domain = await prisma.domain.create({
      data: {
        name: domain.name,
        repository: domain.repository,
        directory: domain.directory,
        ownerId: user.id,
      },
    });

    const team = await prisma.userTeam.findFirst({
      where: {
        userId: user.id,
        teamId: teamId,
      },
    });

    if (!team) {
      throw new Api403Error("User does not have access to this team");
    }

    await prisma.teamDomain.create({
      data: {
        domainId: newDomain.id,
        teamId: teamId,
      },
    });

    return newDomain;
  } catch (err) {
    throw new Api500Error("Fail to create domain");
  }
};

export { createDomain };
