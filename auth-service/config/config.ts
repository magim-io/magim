import dotenv from "dotenv";

dotenv.config({ path: "../env/config.env" });

[
  "NODE_ENV",
  "PORT",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "JWT_SECRET",
  "COOKIE_NAME",
  "MAGIM_WEB_PORT",
].forEach((name) => {
  if (!process.env[name]) {
    throw new Error(`Error: environment variable ${name} is missing`);
  }
});

const CONFIG = {
  ENV: process.env.NODE_ENV,
  SERVER: {
    PORT: process.env.PORT || 5000,
    JWT_SECRET: process.env.JWT_SECRET,
    COOKIE_NAME: process.env.COOKIE_NAME || "magim-token",
  },
  WEB: {
    PORT: process.env.MAGIM_WEB_PORT,
  },
  GITHUB: {
    CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  },
};

export default CONFIG;
