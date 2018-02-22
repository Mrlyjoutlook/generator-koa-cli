const debug = require('debug')('compiler');
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');
const ts = require('typescript');
const lineColumn = require('line-column');
const tsconfig = require('../tsconfig.json');

class Compiler {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * 编译
   */
  transpiler({srcPath, outPath, file}) {
    const filePath = path.join(srcPath, file);
    const pPath = path.dirname(path.join(outPath, file));
    const relativePath = path.relative(pPath, path.join(srcPath, file));
    const content = fs.readFileSync(filePath, 'utf8');
    const data = ts.transpileModule(content, tsconfig);

    // error handle
    if (data.diagnostics && data.diagnostics.length) {
      const firstDiagnostics = data.diagnostics[0];
      if (firstDiagnostics.file && firstDiagnostics.start) {
        const errPos = lineColumn(firstDiagnostics.file.text, firstDiagnostics.start);
        debug(`${firstDiagnostics.messageText} File: ${path.join(srcPath, firstDiagnostics.file.path)} Line: ${errPos.line} Column: ${errPos.col}`);
        return false;
      } else {
        debug(`${firstDiagnostics.messageText}`);
        return false;
      }
    }

    // write js file
    const outFile = path.join(outPath, file).replace(/\.\w+$/, '.js');
    fse.ensureDirSync(path.dirname(outFile));
    fs.writeFileSync(outFile, data.outputText);

    // write map file
    if (tsconfig.compilerOptions && tsconfig.compilerOptions.sourceMap) {
      const sourceMap = JSON.parse(data.sourceMapText);
      sourceMap.file = sourceMap.sources[0] = relativePath;
      fs.writeFileSync(outFile + '.map', JSON.stringify(sourceMap, undefined, 4));
    }

  }
}

module.exports = Compiler;
