import { PrismaClient, Team, User, UserTeam, Domain } from "@prisma/client";
import ErrorResponse from "../../lib/exceptions/error-response.exception";

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
      throw new ErrorResponse("User does not have access to this team", 403);
    }

    await prisma.teamDomain.create({
      data: {
        domainId: newDomain.id,
        teamId: teamId,
      },
    });

    return newDomain;
  } catch (err) {
    throw new ErrorResponse("Fail to create domain", 500);
  }
};

export { createDomain };
