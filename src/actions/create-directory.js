const path = require('path');
const cwd = process.cwd();
const { debug, debugMini, debugError, debugExtra } = require('../debug');
const { readFileOrEmpty, parseOrFalse, invariant } = require('../util');
const variables = require('./_variables');
const shell = require('shelljs');
const { cloneRepo } = require('../index');

/**
 * 根据配置项，获取替换字符串
 *
 * @param {*} configs - 配置对象
 * @param {*} variable - 要替换的变量名
 * @returns
 */
function getReplaceString(configs, variable) {
  const config = configs[variable] || '';

  let result = config;

  // 如果是 peer ，需要特殊处理
  if (variable === 'peer') {
    const externals = configs.externals;
    const externalsPeer = {};
    externals.forEach(external => {
      const keys = Object.keys(external);
      keys.forEach(key => {
        externalsPeer[key] = external[key];
      });
    });

    const resultExternal = Object.assign({}, externalsPeer, config || {});
    // 如果没有 externals 项
    if (!Object.keys(resultExternal).length) {
      result = '';
    } else {
      result = JSON.stringify(resultExternal).replace('{', '').replace('}',','); // 重新揉成 peer 对象
    }
  } else if (Array.isArray(config)) {
    // externals 将 keys 拼成数组
    // 将 [{"ss-tree": "1.2.x", "mobx": "x.x.x"}, "ide-code-editor"] 转换成 ["ss-tree", "mobx", "ide-code-editor"]
    if (variable === 'externals') {
      let arr = [];
      config.forEach(item => {
        arr = arr.concat(Object.keys(item));
      });
      result = JSON.stringify(arr);
    } else {
      result = JSON.stringify(config);
    }
  }

  debugMini(` [${variable.toUpperCase()}] ====> ${result}`);
  return result;
}

/**
 * 根据配置项替换目标文件内容
 *
 * @param {*} targetDirection - 目标文件夹名
 * @param {*} configs - 配置项对象
 */
function replaceFiles(targetDirection, configs) {
  shell.cd(targetDirection); // 切换到当前文件
  // Replace variable values in all files

  // 获取字符串替换映射表
  debugMini(`\n>>> 文件内容替换映射表： <<<`);
  const replaceMap = {};
  variables.forEach(variable => {
    replaceMap[variable] = getReplaceString(configs, variable);
  });
  debugMini('\n');

  shell.ls('-Rl').forEach(entry => {
    if (entry.isFile()) {
      debugMini(`>>> 替换 ${entry.name} 文件内容 <<<`);
      // Replace '[VARIABLE]` with the corresponding variable value from the prompt
      variables.forEach(variable => {
        shell.sed(
          '-i',
          `\\[${variable.toUpperCase()}\\]`,
          replaceMap[variable],
          entry.name
        );
      });

      // This one is just to replace[YEAR] occurrences with the current year.Useful for LICENSE or README.md files.
      // Insert current year in files
      shell.sed('-i', '\\[YEAR\\]', new Date().getFullYear(), entry.name);
    }
  });
}

module.exports = (args, options, logger) => {
  debugMini(`命令行 options: ${JSON.stringify(options)}`);

  // 读取 json 配置文件
  let jsonPath = path.join(cwd, args.jsonfile);
  const configs = parseOrFalse(readFileOrEmpty(jsonPath));
  invariant(!!configs, `${jsonPath} 文件内容为空，请检查`, logger);
  invariant(!!configs.name, `name 属性不能为空`, logger);

  // 重新调整 config 中的 externals 格式为 [{'ss-tree': '1.2.x'},...]
  configs.externals = [].concat(configs.externals || []).map(external => {
    if (typeof external === 'object') {
      return external;
    } else {
      const result = {};
      result[external] = '*';
      return result;
    }
  });

  debugExtra(`====> config 内容 ${JSON.stringify(configs, null, 4)}`);

  const targetDirection = path.join(cwd, configs.name);
  debugMini(`目标文件夹：${targetDirection}`);

  if (options.local) {
    debugMini(`不拉取远程仓库，本地替换`);
    replaceFiles(targetDirection, configs);
  } else {
    cloneRepo(configs.name, () => {
      replaceFiles(targetDirection, configs);
    });
  }
};
