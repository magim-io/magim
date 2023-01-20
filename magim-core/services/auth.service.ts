import axios from "axios";
import querystring from "querystring";
import { GithubUser } from "../../lib/types/github-user";
import Api500Error from "../../lib/errors/api-500.error";
import { PrismaClient, User } from "@prisma/client";
import BaseError from "../../lib/errors/base-error.error";
import Config from "../config/config";

const prisma = new PrismaClient();
const CONFIG = Config.getInstance().config;

const retrieveGithubUser = async ({
  code,
}: {
  code: string;
}): Promise<GithubUser | BaseError> => {
  try {
    const githubToken = await axios.post(
      `https://github.com/login/oauth/access_token?client_id=${CONFIG.GITHUB.CLIENT_ID}&client_secret=${CONFIG.GITHUB.CLIENT_SECRET}&code=${code}`
    );

    const decoded = querystring.parse(githubToken.data);
    const accessToken = decoded.access_token;

    const user = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return user.data;
  } catch (err) {
    return new Api500Error("Failed to retrieve user info from Github.");
  }
};

const loginWithGithub = async ({
  user,
}: {
  user: GithubUser;
}): Promise<User | null | BaseError> => {
  try {
    const { name, avatar_url, bio, email, location, login } = user;

    const extUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (extUser === null) {
      const newUser = await prisma.user.create({
        data: {
          name: name,
          avatarUrl: avatar_url,
          bio: bio,
          email: email,
          location: location,
          login: login,
        },
      });

      return newUser;
    }

    return extUser;
  } catch (err) {
    return new Api500Error("Failed to login user.");
  }
};

export { retrieveGithubUser, loginWithGithub };
