const debug = require('debug')('watcher');
const fs = require('fs');
const path = require('path');

/**
 * default options
 * @type {Object}
 */
const defaultOptions = {
  allowExts: ['js', 'es', 'ts'],
  filter: (fileInfo, options) => {
    const seps = fileInfo.file.split(path.sep);
    // filter hidden file
    const flag = seps.some(item => {
      return item[0] === '.';
    });
    if (flag) {
      return false;
    }
    const ext = path.extname(fileInfo.file).slice(1);
    return options.allowExts.indexOf(ext) !== -1;
  }
};

class Watcher {
  /**
   * constructor
   * @param {Object} options  watch options
   * @param {Function} cb callback when files changed
   */
  constructor(options, cb) {
    options = this.buildOptions(options);
    this.options = options;
    this.cb = cb;
    this.lastMtime = {};
  }

  /**
   * init 参数
   * @param {} options
   */
  buildOptions(options = {}) {
    let srcPath = options.srcPath;
    if (!Array.isArray(srcPath)) {
      srcPath = [srcPath];
    }
    let diffPath = options.diffPath || [];
    if (!Array.isArray(diffPath)) {
      diffPath = [diffPath];
    }
    options.srcPath = srcPath;
    options.diffPath = diffPath;
    if (!options.filter) {
      options.filter = defaultOptions.filter;
    }
    if (!options.allowExts) {
      options.allowExts = defaultOptions.allowExts;
    }
    return options;
  }
  /**
   * 判断路径是否存在
   * @param {} dir
   */
  isExist(dir) {
    dir = path.normalize(dir);
    try {
      fs.accessSync(dir, fs.R_OK);
      return true;
    } catch (e) {
      return false;
    }
  }
  /**
   * 判断是否是文件路径
   * @param {*} filePath
   */
  isFile(filePath) {
    if (!this.isExist(filePath)) return false;
    try {
      const stat = fs.statSync(filePath);
      return stat.isFile();
    } catch (e) {
      return false;
    }
  }
  /**
   * 获取路径下的所有文件
   */
  getdirFiles(dir, prefix = '') {
    dir = path.normalize(dir);
    if (!fs.existsSync(dir)) return [];
    const files = fs.readdirSync(dir);
    let result = [];
    files.forEach(item => {
      const currentDir = path.join(dir, item);
      const stat = fs.statSync(currentDir);
      if (stat.isFile()) {
        result.push(path.join(prefix, item));
      } else if (stat.isDirectory()) {
        const cFiles = this.getdirFiles(currentDir, path.join(prefix, item));
        result = result.concat(cFiles);
      }
    });
    return result;
  };
  /**
   * get changed files
   */
  getChangedFiles() {
    const changedFiles = [];
    const options = this.options;
    options.srcPath.forEach((srcPath, index) => {
      const diffPath = options.diffPath[index];
      const srcFiles = this.getdirFiles(srcPath).filter(file => {
        return options.filter({path: srcPath, file}, options);
      });
      let diffFiles = [];
      if (diffPath) {
        diffFiles = this.getdirFiles(diffPath).filter(file => {
          return options.filter({path: diffPath, file}, options);
        });
        this.removeDeletedFiles(srcFiles, diffFiles, diffPath);
      }
      srcFiles.forEach(file => {
        const mtime = fs.statSync(path.join(srcPath, file)).mtime.getTime();
        if (diffPath) {
          let diffFile = '';
          diffFiles.some(dfile => {
            if (this.removeFileExtName(dfile) === this.removeFileExtName(file)) {
              diffFile = dfile;
              return true;
            }
          });
          const diffFilePath = path.join(diffPath, diffFile);
          // compiled file exist
          if (diffFile && this.isFile(diffFilePath)) {
            const diffmtime = fs.statSync(diffFilePath).mtime.getTime();
            // if compiled file mtime is after than source file, return
            if (diffmtime > mtime) {
              return;
            }
          }
        }
        if (!this.lastMtime[file] || mtime > this.lastMtime[file]) {
          this.lastMtime[file] = mtime;
          changedFiles.push({path: srcPath, file});
        }
      });
    });
    return changedFiles;
  }
  /**
   * remove files in srcPath when is deleted in diffPath
   * @param {Array} srcFiles
   * @param {Array} diffFiles
   * @param {String} diffPath
   */
  removeDeletedFiles(srcFiles, diffFiles, diffPath) {
    const srcFilesWithoutExt = srcFiles.map(file => {
      return this.removeFileExtName(file);
    });
    diffFiles.forEach(file => {
      const fileWithoutExt = this.removeFileExtName(file);
      if (srcFilesWithoutExt.indexOf(fileWithoutExt) === -1) {
        const filepath = path.join(diffPath, file);
        if (this.isFile(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    });
  }
  /**
   * remove file extname
   * @param {String} file
   */
  removeFileExtName(file) {
    return file.replace(/\.\w+$/, '');
  }
  /**
   * 监听文件变动
   */
  watch() {
    const detectFiles = () => {
      const changedFiles = this.getChangedFiles();
      if (changedFiles.length) {
        changedFiles.forEach(item => {
          debug(`file changed: path=${item.path}, file=${item.file}`);
          this.cb(item);
        });
      }
      setTimeout(detectFiles, this.options.interval || 100);
    };
    detectFiles();
  }
}

module.exports = Watcher;
