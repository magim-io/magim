"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const morgan_1 = __importDefault(require("morgan"));
const error_handler_middleware_1 = __importDefault(require("./middleware/error-handler.middleware"));
const config_1 = __importDefault(require("./config/config"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const organizations_route_1 = __importDefault(require("./routes/organizations.route"));
const teams_route_1 = __importDefault(require("./routes/teams.route"));
const domains_route_1 = __importDefault(require("./routes/domains.route"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
if (config_1.default.ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
app.use("/api/auth/github", auth_route_1.default);
app.use("/api/v1/organizations", organizations_route_1.default);
app.use("/api/v1/teams", teams_route_1.default);
app.use("/api/v1/domains", domains_route_1.default);
app.use(error_handler_middleware_1.default);
const server = app.listen(config_1.default.SERVER.PORT, () => {
    console.log(`Server running in ${config_1.default.ENV} mode on port ${config_1.default.SERVER.PORT}`);
});
process.on("unhandledRejection", (err, promise) => {
    console.log(`Error: ${err.message}`);
    server.close(() => process.exit(1));
});
