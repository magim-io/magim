import { createAppAuth } from "@octokit/auth-app";
import axios, { AxiosResponse } from "axios";
import Api500Error from "../../lib/errors/api-500.error";
import BaseError from "../../lib/errors/base-error.error";
import CONFIG from "../config/config";
import { readFile } from "../helpers/fs.helper";

const installDependencyMapAction = async ({
  installationId,
  branch,
  owner,
  repository,
  reference,
}: {
  installationId: string;
  branch: string;
  owner: string;
  repository: string;
  reference: string;
}): Promise<void | BaseError> => {
  try {
    const commitMessage = "install magim dependencymap workflow";

    const fileContent = await readFile({
      filePath: "../../../../lib/actions/magim-dependencymap.yml",
    });

    if (
      CONFIG.GITHUB.APP_SECRET === undefined ||
      CONFIG.GITHUB.APP_ID === undefined
    ) {
      return;
    }

    const auth = createAppAuth({
      appId: CONFIG.GITHUB.APP_ID,
      privateKey: CONFIG.GITHUB.APP_SECRET,
      installationId: installationId,
      clientId: CONFIG.GITHUB.CLIENT_ID,
      clientSecret: CONFIG.GITHUB.CLIENT_SECRET,
    });

    const { token } = await auth({
      type: "installation",
      installationId: installationId,
    });

    console.log("\ntoken", token);

    const lastCommit = await retrieveLastCommitFromBranch({
      branch: branch,
      owner: owner,
      repo: repository,
      token: token,
    });

    if (lastCommit instanceof BaseError) {
      return lastCommit;
    }

    console.log("\nlastCommit", lastCommit.data.commit.sha);

    const blob = await createActionBlob({
      owner: owner,
      repo: repository,
      content: fileContent.toString(),
      token: token,
    });

    if (blob instanceof BaseError) {
      return blob;
    }

    console.log("\nblob", blob.data);

    const tree = await createTreeObject({
      owner: owner,
      repo: repository,
      token: token,
      baseTree: lastCommit.data.commit.sha,
      tree: {
        sha: blob.data["sha"],
        mode: "100644",
        path: ".github/workflows/magim-dependencymap.yml",
        type: "blob",
      },
    });

    if (tree instanceof BaseError) {
      return tree;
    }

    console.log("\ntree", tree.data);

    const commit = await createCommit({
      owner: owner,
      repo: repository,
      message: commitMessage,
      token: token,
      tree: tree.data["sha"],
      parents: [lastCommit.data.commit.sha],
    });

    if (commit instanceof BaseError) {
      return commit;
    }

    console.log("\ncommit", commit.data);

    const ref = await updateReference({
      owner: owner,
      repo: repository,
      ref: reference,
      sha: commit.data["sha"],
      token: token,
    });

    if (ref instanceof BaseError) {
      return ref;
    }

    console.log("\nref", ref.data);
  } catch (err) {
    return new Api500Error("Fail to install dependency map action");
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

    return commit;
  } catch (err) {
    return new Api500Error("Fail to retrieve last commit from branch");
  }
};

const createActionBlob = async ({
  owner,
  repo,
  content,
  token,
}: {
  owner: string;
  repo: string;
  content: string;
  token: string;
}): Promise<AxiosResponse<any, any> | BaseError> => {
  const payload = {
    content: content,
    encoding: "utf8",
  };
  try {
    const blob = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/git/blobs`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return blob;
  } catch (err) {
    return new Api500Error("Fail to create blob");
  }
};

const createTreeObject = async ({
  owner,
  repo,
  tree,
  token,
  baseTree,
}: {
  owner: string;
  repo: string;
  tree: {
    path: string;
    mode: string;
    type: string;
    sha: string;
  };
  token: string;
  baseTree: string;
}): Promise<AxiosResponse<any, any> | BaseError> => {
  const payload = {
    base_tree: baseTree,
    tree: [
      {
        path: tree.path,
        mode: tree.mode,
        type: tree.type,
        sha: tree.sha,
      },
    ],
  };
  try {
    const tree = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return tree;
  } catch (err) {
    return new Api500Error("Fail to create tree");
  }
};

const createCommit = async ({
  owner,
  repo,
  message,
  tree,
  token,
  parents,
}: {
  owner: string;
  repo: string;
  message: string;
  tree: string;
  token: string;
  parents: string[];
}): Promise<AxiosResponse<any, any> | BaseError> => {
  const payload = {
    message: message,
    tree: tree,
    parents: parents,
  };
  try {
    const commit = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return commit;
  } catch (err) {
    return new Api500Error("Fail to create commit", 500);
  }
};

const createReference = async ({
  owner,
  repo,
  ref,
  sha,
  token,
}: {
  owner: string;
  repo: string;
  ref: string;
  sha: string;
  token: string;
}): Promise<AxiosResponse<any, any> | BaseError> => {
  try {
    const payload = {
      ref: ref,
      sha: sha,
    };
    const reference = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return reference;
  } catch (err) {
    return new Api500Error("Fail to create reference", 500);
  }
};

const updateReference = async ({
  owner,
  repo,
  ref,
  sha,
  token,
}: {
  owner: string;
  repo: string;
  ref: string;
  sha: string;
  token: string;
}): Promise<AxiosResponse<any, any> | BaseError> => {
  try {
    const payload = {
      sha: sha,
      force: false,
    };
    const reference = await axios.patch(
      `https://api.github.com/repos/${owner}/${repo}/git/${ref}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return reference;
  } catch (err) {
    return new Api500Error("Fail to update reference", 500);
  }
};

export { installDependencyMapAction };
