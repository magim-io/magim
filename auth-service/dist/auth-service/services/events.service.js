"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.installDependencyMapAction = void 0;
const auth_app_1 = require("@octokit/auth-app");
const axios_1 = __importDefault(require("axios"));
const api_500_error_1 = __importDefault(require("../../lib/errors/api-500.error"));
const config_1 = __importDefault(require("../config/config"));
const fs_helper_1 = require("../helpers/fs.helper");
const installDependencyMapAction = ({ installationId, branch, owner, repository, reference, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const commitMessage = "install magim dependencymap workflow";
        const fileContent = yield (0, fs_helper_1.readFile)({
            filePath: "../../../../lib/actions/magim-dependencymap.yml",
        });
        if (config_1.default.GITHUB.APP_SECRET === undefined ||
            config_1.default.GITHUB.APP_ID === undefined) {
            return;
        }
        const auth = (0, auth_app_1.createAppAuth)({
            appId: config_1.default.GITHUB.APP_ID,
            privateKey: config_1.default.GITHUB.APP_SECRET,
            installationId: installationId,
            clientId: config_1.default.GITHUB.CLIENT_ID,
            clientSecret: config_1.default.GITHUB.CLIENT_SECRET,
        });
        const { token } = yield auth({
            type: "installation",
            installationId: installationId,
        });
        console.log("\ntoken", token);
        const lastCommit = yield retrieveLastCommitFromBranch({
            branch: branch,
            owner: owner,
            repo: repository,
            token: token,
        });
        console.log("\nlastCommit", lastCommit.data.commit.sha);
        const blob = yield createActionBlob({
            owner: owner,
            repo: repository,
            content: fileContent.toString(),
            token: token,
        });
        console.log("\nblob", blob.data);
        const tree = yield createTreeObject({
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
        const commit = yield createCommit({
            owner: owner,
            repo: repository,
            message: commitMessage,
            token: token,
            tree: tree.data["sha"],
            parents: [lastCommit.data.commit.sha],
        });
        console.log("\ncommit", commit.data);
        const ref = yield updateReference({
            owner: owner,
            repo: repository,
            ref: reference,
            sha: commit.data["sha"],
            token: token,
        });
        console.log("\nref", ref.data);
    }
    catch (err) {
        throw new api_500_error_1.default("Fail to install dependency map action");
    }
});
exports.installDependencyMapAction = installDependencyMapAction;
const retrieveLastCommitFromBranch = ({ owner, repo, branch, token, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const commit = yield axios_1.default.get(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return commit;
    }
    catch (err) {
        throw new api_500_error_1.default("Fail to retrieve last commit from branch");
    }
});
const createActionBlob = ({ owner, repo, content, token, }) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        content: content,
        encoding: "utf8",
    };
    try {
        const blob = yield axios_1.default.post(`https://api.github.com/repos/${owner}/${repo}/git/blobs`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return blob;
    }
    catch (err) {
        throw new api_500_error_1.default("Fail to create blob");
    }
});
const createTreeObject = ({ owner, repo, tree, token, baseTree, }) => __awaiter(void 0, void 0, void 0, function* () {
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
        const tree = yield axios_1.default.post(`https://api.github.com/repos/${owner}/${repo}/git/trees`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return tree;
    }
    catch (err) {
        throw new api_500_error_1.default("Fail to create tree");
    }
});
const createCommit = ({ owner, repo, message, tree, token, parents, }) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        message: message,
        tree: tree,
        parents: parents,
    };
    try {
        const commit = yield axios_1.default.post(`https://api.github.com/repos/${owner}/${repo}/git/commits`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return commit;
    }
    catch (err) {
        throw new api_500_error_1.default("Fail to create commit", 500);
    }
});
const createReference = ({ owner, repo, ref, sha, token, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = {
            ref: ref,
            sha: sha,
        };
        const reference = yield axios_1.default.post(`https://api.github.com/repos/${owner}/${repo}/git/refs`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return reference;
    }
    catch (err) {
        throw new api_500_error_1.default("Fail to create reference", 500);
    }
});
const updateReference = ({ owner, repo, ref, sha, token, }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payload = {
            sha: sha,
            force: false,
        };
        const reference = yield axios_1.default.patch(`https://api.github.com/repos/${owner}/${repo}/git/${ref}`, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return reference;
    }
    catch (err) {
        throw new api_500_error_1.default("Fail to update reference", 500);
    }
});
