import * as Router from 'koa-router';

const router = new Router();

const home = require('./home');

router.use('/', home.routes(), home.allowedMethods);

module.exports = router;
