#!/usr/bin/env node
'use strict';

const program = require('commander'),
    packConf = require('../package.json'),
    spawn = require('cross-spawn'),
    path = require('path'),
    fs = require('fs-extra'),
    chalk = require('chalk'),
    { mkdirpSync, copySync, writeJsonSync } = require('fs-extra'),
    vfs = require('vinyl-fs');

function wrap(sp) {
    sp.on('close', function (code) {
        process.exit(code);
    });
}

function executable(subcmd) {
    var file = path.join(__dirname, subcmd + '.js');
    if (fs.existsSync(file)) {
        return file;
    }
}

program
    .version(packConf.version)
//   .option('-C, --chdir <path>', 'change the working directory')
//   .option('-c, --config <path>', 'set config path. defaults to ./deploy.conf')
//   .option('-T, --no-tests', 'ignore test hook')


program
    .command('ts [name]')
    .description('构建项目工程(ts)')
    .usage('<project name>')
    .action(function (name) {
        console.log(chalk.green('far: build project.'));
        /**
         * 判断是否存在文件
         * 是 -> 提示
         * 否 -> 执行命令
         */
        if (fs.existsSync(name)) {
            console.log(chalk.red('far: project name is exist!'));
            process.exit(1);
        } else {
            console.log(chalk.green('far: executing command...'));
            const dest = path.join(process.cwd(), name);
            const cwd = path.join(__dirname, '../template-ts/');
            mkdirpSync(dest);
            vfs.src(['bin/**/*', 'src/**/*', 'static/**/*', '.editorconfig', '.gitignore', 'nodemon.json', 'package.json', 'tsconfig.json', 'tslint.json'], { cwd: cwd, cwdbase: true, dot: true })
                .pipe(vfs.dest(dest))
                .on('end', function () {
                    console.log(chalk.green('far: building ok'));
                });
        }
    }).on('--help', function () {
        console.log('  Examples:');
        console.log();
        console.log('    $ far ts myapp');
        console.log();
    });

program
    .command('*')
    .description('无此命令')
    .action(function (cmd) {
        console.log('far: deploying "%s"', cmd);
    });

program.parse(process.argv);
