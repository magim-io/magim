import CONFIG from "../config/config";
import axios from "axios";
import querystring from "query-string";
import { GithubUser } from "../models/github-user.model";
import ErrorResponse from "../../common/exceptions/error-response.exception";

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
    throw new ErrorResponse("Failed to retrieve user info from Github", 500);
  }
};

export { retrieveGithubUser };
