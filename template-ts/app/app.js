"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const bodyParser = require('koa-bodyParser');
const path = require('path');
const resource = require('koa-static');
const views = require('koa-views');
const debug = require('debug')('app');
const routers = require('./routers');
class App {
    constructor(options = {}) {
        if (!options.APP_PATH) {
            options.APP_PATH = path.join(options.ROOT_PATH, '../app');
        }
        this.options = options;
        this.app = new Koa();
    }
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
        }, (fileInfo) => {
            compiler.transpiler({
                srcPath: fileInfo.path,
                outPath: this.options.APP_PATH,
                file: fileInfo.file,
            });
        });
        instance.watch();
    }
    load() {
        this.app.use(resource(path.join(__dirname, '../static')));
        this.app.use(views(path.join(__dirname, './views'), {
            extension: 'ejs'
        }));
        this.app.use(bodyParser());
        this.app.use(routers.routes()).use(routers.allowedMethods());
    }
    run() {
        if (this.options.env === 'development') {
            this.startWatcher();
        }
        this.load();
        this.app.listen(this.options.prot);
    }
}
module.exports = App;
//# sourceMappingURL=app.js.map