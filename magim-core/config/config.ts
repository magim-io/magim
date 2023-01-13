import dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
  dotenv.config({ path: "../env/config.dev.env" });
  [
    "NODE_ENV",
    "PORT",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "JWT_SECRET",
    "COOKIE_NAME",
    "MAGIM_WEB_PORT",
    "GITHUB_APP_SECRET",
    "GITHUB_APP_ID",
  ].forEach((name) => {
    if (!process.env[name]) {
      throw new Error(`Error: environment variable ${name} is missing`);
    }
  });
} else {
  dotenv.config({ path: "../env/config.prod.env" });
  [
    "NODE_ENV",
    "PORT",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "JWT_SECRET",
    "COOKIE_NAME",
    "MAGIM_WEB_PORT",
    "GITHUB_APP_SECRET",
    "GITHUB_APP_ID",
  ].forEach((name) => {
    if (!process.env[name]) {
      throw new Error(`Error: environment variable ${name} is missing`);
    }
  });
}

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
    APP_ID: process.env.GITHUB_APP_ID,
    CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    APP_SECRET: process.env.GITHUB_APP_SECRET,
  },
};

Object.values(CONFIG).forEach((value) => {
  if (value === undefined) {
    throw new Error(`Error: undefined environment variable found`);
  }
});

export default CONFIG;
