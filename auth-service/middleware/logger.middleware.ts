import winston from "winston";

const options = {
  console: {
    level: "debug",
    handleExceptions: true,
    json: false,
    colorize: true,
  },
};

const logger = winston.createLogger({
  levels: winston.config.npm.levels,
  transports: [new winston.transports.Console(options.console)],
  exitOnError: false,
});

export default logger;
