import { createAppAuth } from "@octokit/auth-app";
import {
  PrismaClient,
  Team,
  User,
  UserTeam,
  Domain,
  TeamDomain,
  Map,
} from "@prisma/client";
import axios, { Axios, AxiosError, AxiosResponse } from "axios";
import Api403Error from "../../lib/errors/api-403.error";
import Api404Error from "../../lib/errors/api-404.error";
import Api500Error from "../../lib/errors/api-500.error";
import BaseError from "../../lib/errors/base-error.error";
import { GithubInstallation } from "../../lib/types/github-installation";
import { VersionDTO } from "../dto/version.dto";
import * as eventService from "../services/events.service";
import { MAGIM_MANAGED } from "../../lib/constants/app.constant";
import Config from "../config/config";
import httpStatusCodes from "../../lib/errors/http-status-codes.constant";

const prisma = new PrismaClient();
const CONFIG = Config.getInstance().config;

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
      return new Api403Error("User does not have access to this team.");
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
    return new Api500Error("Failed to create domain.");
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
      return new Api404Error("User does not belong to any team.");
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
    return new Api500Error("Failed to retrieve domains.");
  }
};

const runWorkflow = async ({
  version,
}: {
  version: VersionDTO;
}): Promise<void | BaseError> => {
  try {
    const auth = createAppAuth({
      appId: CONFIG.GITHUB.APP_ID!,
      privateKey: CONFIG.GITHUB.APP_SECRET!,
      clientId: CONFIG.GITHUB.CLIENT_ID,
      clientSecret: CONFIG.GITHUB.CLIENT_SECRET,
    });

    const appAuthentication = await auth({
      type: "app",
    });

    const installations = await axios.get(
      "https://api.github.com/app/installations",
      {
        headers: {
          Authorization: `Bearer ${appAuthentication.token}`,
        },
      }
    );

    if (installations instanceof AxiosError) {
      throw installations;
    }

    let installation: GithubInstallation = installations.data.find(
      (item: GithubInstallation) => item.account.login === version.owner
    );

    const installed = await isMagimInstalled({
      owner: version.owner,
      repository: version.repository,
    });

    if (installed === true) {
      await reRunWorkflow({
        owner: version.owner,
        repository: version.repository,
        installationId: installation.id.toString(),
      });
      return;
    }

    let event = await eventService.installDependencyMapAction({
      installationId: installation.id.toString(),
      branch: "master",
      owner: version.owner,
      reference: `refs/heads/${MAGIM_MANAGED}`,
      repository: version.repository,
    });

    if (event instanceof BaseError) {
      throw event;
    }
  } catch (err) {
    return new Api500Error(`Failed to run workflow.`);
  }
};

const isMagimInstalled = async ({
  owner,
  repository,
}: {
  owner: string;
  repository: string;
}): Promise<boolean | BaseError> => {
  try {
    let domain = await prisma.domain.findFirst({
      where: {
        repository: `${owner}/${repository}`,
      },
    });

    if (domain === null) {
      return false;
    }

    let map = await prisma.map.findFirst({
      where: {
        domainId: domain.id,
      },
    });

    if (map === null) {
      return false;
    }

    return true;
  } catch (err) {
    return new Api500Error("Failed to check if Magim is installed.");
  }
};

const retrieveLastCommitFromBranch = async ({
  owner,
  repo,
  branch,
  token,
}: {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}): Promise<AxiosResponse<any, any> | BaseError> => {
  try {
    const commit = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (commit.status !== 200) {
      throw commit;
    }

    return commit;
  } catch (err) {
    return new Api500Error("Failed to retrieve last commit from branch.");
  }
};

const reRunWorkflow = async ({
  owner,
  repository,
  installationId,
}: {
  owner: string;
  repository: string;
  installationId: string;
}): Promise<void | BaseError> => {
  try {
    const auth = createAppAuth({
      appId: CONFIG.GITHUB.APP_ID!,
      privateKey: CONFIG.GITHUB.APP_SECRET!,
      installationId: installationId,
      clientId: CONFIG.GITHUB.CLIENT_ID,
      clientSecret: CONFIG.GITHUB.CLIENT_SECRET,
    });

    const appAuthentication = await auth({
      type: "installation",
      installationId: installationId,
    });

    const { token } = appAuthentication;

    const workflows = await axios.get(
      `https://api.github.com/repos/${owner}/${repository}/actions/workflows`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (workflows instanceof AxiosError) {
      throw workflows;
    }

    let workflow = workflows.data.workflows.find(
      (item: any) => item.path === ".github/workflows/magim-dependencymap.yml"
    );

    const rerun = await axios.post(
      `https://api.github.com/repos/${owner}/${repository}/actions/workflows/${workflow.id}/dispatches`,
      {
        ref: `${MAGIM_MANAGED}`,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (rerun instanceof AxiosError) {
      throw rerun;
    }
  } catch (err) {
    return new Api500Error("Failed to re-run workflow.");
  }
};

const retrieveMaps = async ({
  user,
  domainId,
}: {
  user: User;
  domainId: string;
}): Promise<Map[] | BaseError> => {
  try {
    const team = await prisma.teamDomain.findFirst({
      where: {
        domainId: domainId,
      },
    });

    if (team === null) {
      throw new Api404Error("Domain does not exist.");
    }

    const isInTeam = await prisma.userTeam.findFirst({
      where: {
        teamId: team?.teamId,
        userId: user.id,
      },
    });

    if (isInTeam === null) {
      throw new Api403Error(
        "User does not have access to this domain's resources. Reason: user does not belong to the assigned teams."
      );
    }

    const maps = await prisma.map.findMany({
      where: {
        domainId: domainId,
      },
    });

    if (maps === null) {
      throw new Api404Error("Map does not exist.");
    }

    return maps;
  } catch (err) {
    return new Api500Error("Failed to retrieve maps.");
  }
};

export { createDomain, retrieveDomains, runWorkflow, retrieveMaps };
