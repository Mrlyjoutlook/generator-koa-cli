"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Router = require("koa-router");
const router = new Router();
const home = require('./home');
router.use('/', home.routes(), home.allowedMethods);
module.exports = router;
//# sourceMappingURL=index.js.map