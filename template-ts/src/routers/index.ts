import * as Router from 'koa-router';

const home = require('./home');

const router = new Router();

router.use('/', home.routes(), home.allowedMethods);

module.exports = router;
