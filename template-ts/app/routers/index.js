"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const home = require('./home');
const router = new Router();
router.use('/', home.routes(), home.allowedMethods);
module.exports = router;
//# sourceMappingURL=index.js.map