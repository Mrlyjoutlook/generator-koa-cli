import * as Router from 'koa-router';

const router = new Router();

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello world!'
  });
});

module.exports = router;
