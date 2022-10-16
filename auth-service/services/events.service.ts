import { createAppAuth } from "@octokit/auth-app";
import axios, { AxiosResponse } from "axios";
import ErrorResponse from "../../lib/exceptions/error-response.exception";
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
}): Promise<void> => {
  try {
    // const fileContent = await readFile({
    //   filePath: "../../../../lib/actions/magim-dependencymap.yml",
    // });

    // if (
    //   CONFIG.GITHUB.APP_SECRET === undefined ||
    //   CONFIG.GITHUB.APP_ID === undefined
    // ) {
    //   return;
    // }

    // const auth = createAppAuth({
    //   appId: CONFIG.GITHUB.APP_ID,
    //   privateKey: CONFIG.GITHUB.APP_SECRET,
    //   installationId: installationId,
    //   clientId: CONFIG.GITHUB.CLIENT_ID,
    //   clientSecret: CONFIG.GITHUB.CLIENT_SECRET,
    // });

    // const { token } = await auth({
    //   type: "installation",
    //   installationId: installationId,
    // });

    // console.log("\ntoken", token);

    // const lastCommit = await retrieveLastCommitFromBranch({
    //   branch: "main",
    //   owner: "magim-io",
    //   repo: "hunterrank",
    //   token: token,
    // });

    // console.log("\nlastCommit", lastCommit.data.commit.sha);

    // const blob = await createActionBlob({
    //   owner: "magim-io",
    //   repo: "hunterrank",
    //   content: fileContent.toString(),
    //   token: token,
    // });
    // console.log("\nblob", blob.data);

    // const tree = await createTreeObject({
    //   owner: "magim-io",
    //   repo: "hunterrank",
    //   token: token,
    //   baseTree: lastCommit.data.commit.sha,
    //   tree: {
    //     sha: blob.data["sha"],
    //     mode: "100644",
    //     path: ".github/workflows/magim-dependencymap.yml",
    //     type: "blob",
    //   },
    // });
    // console.log("\ntree", tree.data);

    // const commit = await createCommit({
    //   owner: "magim-io",
    //   repo: "hunterrank",
    //   message: "install magim dependencymap workflow",
    //   token: token,
    //   tree: tree.data["sha"],
    //   parents: [lastCommit.data.commit.sha],
    // });
    // console.log("\ncommit", commit.data);

    // const ref = await updateReference({
    //   owner: "magim-io",
    //   repo: "hunterrank",
    //   ref: "refs/heads/main",
    //   sha: commit.data["sha"],
    //   token: token,
    // });

    // console.log("\nref", ref.data);

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

    console.log("\nlastCommit", lastCommit.data.commit.sha);

    const blob = await createActionBlob({
      owner: owner,
      repo: repository,
      content: fileContent.toString(),
      token: token,
    });
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
    console.log("\ntree", tree.data);

    const commit = await createCommit({
      owner: owner,
      repo: repository,
      message: commitMessage,
      token: token,
      tree: tree.data["sha"],
      parents: [lastCommit.data.commit.sha],
    });
    console.log("\ncommit", commit.data);

    const ref = await updateReference({
      owner: owner,
      repo: repository,
      ref: reference,
      sha: commit.data["sha"],
      token: token,
    });

    console.log("\nref", ref.data);
  } catch (err) {
    throw new ErrorResponse("Fail to install dependency map action", 500);
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
}): Promise<AxiosResponse<any, any>> => {
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
    throw new ErrorResponse("Fail to retrieve last commit from branch", 500);
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
}): Promise<AxiosResponse<any, any>> => {
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
    throw new ErrorResponse("Fail to create blob", 500);
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
}): Promise<AxiosResponse<any, any>> => {
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
    throw new ErrorResponse("Fail to create tree", 500);
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
}): Promise<AxiosResponse<any, any>> => {
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
    throw new ErrorResponse("Fail to create commit", 500);
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
}): Promise<AxiosResponse<any, any>> => {
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
    throw new ErrorResponse("Fail to create reference", 500);
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
}): Promise<AxiosResponse<any, any>> => {
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
    throw new ErrorResponse("Fail to update reference", 500);
  }
};

export { installDependencyMapAction };
