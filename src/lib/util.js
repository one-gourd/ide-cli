const fs = require('fs');
const { debug, debugMini, debugError, debugExtra } = require('./debug');


function invariant(check, message, logger = console) {
  if (!check) {
    logger.error('[ide-cli] Invariant failed: ' + message);
    process.exit(1);
  }
}
function readFileOrEmpty(filepath) {
  try {
    debugMini('=====> 读取 ' + filepath + '文件内容');
    return fs.readFileSync(filepath, 'utf8');
  } catch (e) {
    debugError('=====> 读取 ' + filepath + '文件内容失败');
    return '';
  }
}

function writeFileOrNone(filepath, data) {
  fs.writeFile(filepath, data, 'utf8', function(err) {
    if (err) {
      console.log('=====> 写入数据到' + filepath + '失败', err);
      debugError('=====> 想要写入的数据：' + data);
      return;
    }

    debugMini('=====> 已将数据写入到：' + filepath);
    debug('=====> 文件内容：' + data);
  });
}

function isExistFile(filepath) {
  var exist = true;

  try {
    var stat = fs.statSync(filepath);
  } catch (e) {
    debugError('=====> 判断 ' + filepath + ' 目录是否存在失败');
    debugError(e);
    exist = false;
  }

  return exist;
}

function parseOrFalse(str) {
  var json = {};
  try {
    if (str.length) {
      json = JSON.parse(str);
      debugMini('=====> 将字符串解析成 JSON 成功');
      debug('=====> 获得的 JSON 的内容：' + json);

      return json;
    } else {
      return false;
    }
  } catch (err) {
    debugError('=====> 将字符串解析成 JSON 失败：', err);
    debugError('=====> 原字符串内容：' + str);

    return false;
  }
}

// 新建文件夹
function mkdirSyncOrNone(filepath) {
  try {
    fs.mkdirSync(filepath);
    debugMini('=====> 创建文件夹成功：' + filepath);
  } catch (e) {
    if (e.code == 'EEXIST') {
      debugMini('=====> 文件夹已存在不需要创建');
    } else {
      // 如果不是文件已存在的案例，则直接抛出错误
      debugError('=====> 创建文件夹失败：', e);
      console.log('文件夹:', filepath, '创建失败');
      throw e;
    }
  }
}
function escapeRegex(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function isTrue(val) {
  return val === 'true' || val === true;
}

/**
 * 通过配置文件给命令行工具添加选项
 */
const defaultCliKeys = ['option', 'argument', 'command'];
function applyConfig(program, cliConfig, excludes = []) {
  const excludeKeys = [].concat(excludes);
  Object.keys(cliConfig).forEach(configKey => {
    // 对配置项做差集
    if (
      !!~defaultCliKeys.indexOf(configKey) &&
      !~excludeKeys.indexOf(configKey)
    ) {
      const configs = [].concat(cliConfig[configKey]);
      // 兼容一维数组情况，如果是字符串
      if (typeof configs[0] === 'string') {
        program = program[configKey](...configs);
      } else {
        // 如果是二维数组，多种配置情况下，需要循环拆解
        configs.forEach(config => {
          program = program[configKey](...config);
        });
      }
    }
  });
  return program;
}

function pick(object, paths) {
  const obj = {};
  for (const path of paths) {
    if (isExist(object[path])) {
      obj[path] = object[path];
    }
  }
  return obj;
}
function isExist(val) {
  return typeof val !== 'undefined' && val !== null;
}

module.exports = {
  applyConfig,
  readFileOrEmpty,
  writeFileOrNone,
  isExistFile,
  isExist,
  pick,
  parseOrFalse,
  escapeRegex,
  mkdirSyncOrNone,
  invariant,
  isTrue
};
