"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const error_handler_middleware_1 = require("./middleware/error-handler.middleware");
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const organizations_route_1 = __importDefault(require("./routes/organizations.route"));
const teams_route_1 = __importDefault(require("./routes/teams.route"));
const domains_route_1 = __importDefault(require("./routes/domains.route"));
const events_route_1 = __importDefault(require("./routes/events.route"));
const http_logger_middleware_1 = __importDefault(require("./middleware/http-logger.middleware"));
const maps_route_1 = __importDefault(require("./routes/maps.route"));
const config_1 = __importDefault(require("./config/config"));
const app = (0, express_1.default)();
config_1.default.getInstance();
const CONFIG = config_1.default.getInstance().config;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
if (CONFIG.ENV === "development") {
    // app.use(morgan("dev"));
    app.use(http_logger_middleware_1.default);
}
app.use("/api/auth/github", auth_route_1.default);
app.use("/api/v1/organizations", organizations_route_1.default);
app.use("/api/v1/teams", teams_route_1.default);
app.use("/api/v1/domains", domains_route_1.default);
app.use("/api/v1/events", events_route_1.default);
app.use("/api/v1/maps", maps_route_1.default);
app.use(error_handler_middleware_1.errorHandler);
const server = app.listen(CONFIG.SERVER.PORT, () => {
    console.log(`Server running in ${CONFIG.ENV} mode on port ${CONFIG.SERVER.PORT}`);
});
process.on("unhandledRejection", (err, promise) => {
    throw err;
});
process.on("uncaughtException", (err) => {
    (0, error_handler_middleware_1.logError)(err);
    if (!(0, error_handler_middleware_1.isOperationalError)(err)) {
        server.close(() => process.exit(1));
    }
});
