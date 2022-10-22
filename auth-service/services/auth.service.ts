import CONFIG from "../config/config";
import axios from "axios";
import querystring from "query-string";
import { GithubUser } from "../models/github-user.model";
import Api500Error from "../../lib/errors/api-500.error";
import { PrismaClient, User } from "@prisma/client";

const prisma = new PrismaClient();

const retrieveGithubUser = async ({
  code,
}: {
  code: string;
}): Promise<GithubUser> => {
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
    throw new Api500Error("Failed to retrieve user info from Github");
  }
};

const loginWithGithub = async ({
  user,
}: {
  user: GithubUser;
}): Promise<User | null> => {
  try {
    const { name, avatar_url, bio, email, location, login } = user;

    const extUser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (user === null) {
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
    throw new Api500Error("Failed to login user");
  }
};

export { retrieveGithubUser, loginWithGithub };
