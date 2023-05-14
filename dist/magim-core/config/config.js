"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// if (process.env.NODE_ENV === "production") {
//   dotenv.config({ path: "../env/config.prod.env" });
// } else {
//   dotenv.config({ path: "../env/config.dev.env" });
// }
// [
//   "NODE_ENV",
//   "PORT",
//   "GITHUB_CLIENT_ID",
//   "GITHUB_CLIENT_SECRET",
//   "JWT_SECRET",
//   "COOKIE_NAME",
//   "MAGIM_WEB_PORT",
//   "GITHUB_APP_SECRET",
//   "GITHUB_APP_ID",
// ].forEach((name) => {
//   if (!process.env[name]) {
//     throw new Error(`Error: environment variable ${name} is missing`);
//   }
// });
// interface Config {
//   ENV: string | undefined;
//   SERVER: {
//     PORT: string | number;
//     JWT_SECRET: string | undefined;
//     COOKIE_NAME: string;
//   };
//   WEB: {
//     PORT: string | undefined;
//   };
//   GITHUB: {
//     APP_ID: string;
//     CLIENT_ID: string | undefined;
//     CLIENT_SECRET: string | undefined;
//     APP_SECRET: string;
//   };
// }
// const CONFIG: Config = {
//   ENV: process.env.NODE_ENV,
//   SERVER: {
//     PORT: process.env.PORT || 5000,
//     JWT_SECRET: process.env.JWT_SECRET,
//     COOKIE_NAME: process.env.COOKIE_NAME || "magim-token",
//   },
//   WEB: {
//     PORT: process.env.MAGIM_WEB_PORT,
//   },
//   GITHUB: {
//     APP_ID: process.env.GITHUB_APP_ID,
//     CLIENT_ID: process.env.GITHUB_CLIENT_ID,
//     CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
//     APP_SECRET: process.env.GITHUB_APP_SECRET,
//   },
// };
// Object.values(CONFIG).forEach((value) => {
//   if (value === undefined) {
//     throw new Error(`Error: undefined environment variable found`);
//   }
// });
// export default CONFIG;
class Config {
    constructor() {
        if (process.env.NODE_ENV === "production") {
            dotenv_1.default.config({ path: "./env/config.prod.env" });
        }
        else {
            dotenv_1.default.config({ path: "./env/config.dev.env" });
        }
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
        this._config = {
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
        Object.values(this.config).forEach((value) => {
            if (value === undefined) {
                throw new Error(`Error: undefined environment variable found`);
            }
        });
    }
    static getInstance() {
        if (this._instance) {
            return this._instance;
        }
        this._instance = new Config();
        return this._instance;
    }
    get config() {
        return this._config;
    }
}
exports.default = Config;
