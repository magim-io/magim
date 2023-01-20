import Api500Error from "../../lib/errors/api-500.error";
import { Map, MapType, PrismaClient, User } from "@prisma/client";
import BaseError from "../../lib/errors/base-error.error";
import Api404Error from "../../lib/errors/api-404.error";
import Api403Error from "../../lib/errors/api-403.error";

const prisma = new PrismaClient();

const createMap = async ({
  repository,
  payload,
}: {
  repository: string;
  payload: string;
}): Promise<Map | BaseError> => {
  try {
    const repo = repository.replace(/"/gi, "");

    const domain = await prisma.domain.findFirst({
      where: {
        repository: repo,
      },
    });

    if (domain === null) {
      return new Api500Error("Repository does not exist.");
    }

    const map = await prisma.map.create({
      data: {
        payload: payload,
        type: MapType.DEPENDENCY,
        domainId: domain.id,
      },
    });

    return map;
  } catch (err) {
    return new Api500Error("Failed to create map.");
  }
};

export { createMap };
