import Api500Error from "../../lib/errors/api-500.error";
import { Map, MapType, PrismaClient } from "@prisma/client";
import BaseError from "../../lib/errors/base-error.error";

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
    console.log("\nrepo", repo);
    console.log("\ntypeof payload", typeof payload);
    console.log("\npayload", payload);

    const domain = await prisma.domain.findFirst({
      where: {
        repository: repo,
      },
    });

    if (domain === null) {
      return new Api500Error("Repository does not exist");
    }

    console.log("\ndomain.id", domain.id);

    const map = await prisma.map.create({
      data: {
        payload: payload,
        type: MapType.DEPENDENCY,
        version: "0.0.1",
        domainId: domain.id,
      },
    });

    return map;
  } catch (err) {
    return new Api500Error("Failed to create map");
  }
};

export { createMap };
