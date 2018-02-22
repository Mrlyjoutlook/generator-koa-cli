import * as Koa from 'koa';
const bodyParser = require('koa-bodyParser');
const path = require('path');
const resource = require('koa-static');
const views = require('koa-views');
const debug = require('debug')('app');
const routers = require('./routers');

interface Options {
  [propName: string]: any;
}

interface FileInfo {
  path: string;
  file: string;
}

class App {

  options: Options;
  app: Koa;

  constructor(options: Options = {}) {
    if (!options.APP_PATH) {
      options.APP_PATH = path.join(options.ROOT_PATH, '../app');
    }
    this.options = options;
    this.app = new Koa();
  }
  /**
   * start watcher
   */
  startWatcher() {
    const Watcher = this.options.watcher;
    const Compiler = this.options.compiler;
    if (!Watcher || !Compiler) {
      return false;
    }
    const compiler = new Compiler();
    const instance = new Watcher({
      srcPath: path.join(this.options.ROOT_PATH, '../src'),
      outPath: this.options.APP_PATH,
      diffPath: this.options.APP_PATH
    }, (fileInfo: FileInfo) => {
      compiler.transpiler({
        srcPath: fileInfo.path,
        outPath: this.options.APP_PATH,
        file: fileInfo.file,
      });
    });
    instance.watch();
  }
  /**
   * load middleware
   */
  load() {
    // 静态资源
    this.app.use(resource(path.join( __dirname,  '../static')));
    // 加载模板引擎
    this.app.use(views(path.join(__dirname, './views'), {
      extension: 'ejs'
    }));
    // 请求处理
    this.app.use(bodyParser());
    // 路由
    this.app.use(routers.routes()).use(routers.allowedMethods());
  }
  /**
   * run
   */
  run() {
    // 开发环境时启用编译和重启功能
    if (this.options.env === 'development') {
      this.startWatcher();
    }
    // 加载中间件
    this.load();
    // 启动服务
    this.app.listen(this.options.prot);
  }
}

module.exports = App;
