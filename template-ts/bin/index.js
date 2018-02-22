const App = require('../app/app');
const watcher = require('./watch');
const compiler = require('./compile');

/**
 * development
 */
const app = new App({
  ROOT_PATH: __dirname,
  watcher,
  compiler,
  env: 'development',
  prot: 3000,
});

/**
 * production
 */
// const app = new App({
//   ROOT_PATH: __dirname,
//   env: 'production',
//   prot: '3000',
// });

app.run();
