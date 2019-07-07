const clone = require('git-clone');
const { invariant } = require('../../lib/util');
const { debugMini } = require('../../lib/debug');

// const TPL_REPO_URL =
// 'https://github.com/one-gourd/ide-tpl-component-use-engine.git';
const TPL_REPO_URL =
  'https://github.com/one-gourd/ide-tpl-component-neatly.git';

/**
 * 从远程拉取模板代码
 *
 * @param {*} target - 目标文件夹
 * @param {*} callback - 新建文件夹后的 callback
 * @param {*} [templater=TPL_REPO_URL] - 样板 git 仓库地址
 */
function cloneRepo(target, callback, templater = TPL_REPO_URL) {
  invariant(!!target, '必须传入目录地址');
  debugMini(`开始拉取远程仓库：${templater}`);
  clone(templater, target, function() {
    debugMini(`成功拉取到本地，文件夹重命名为 ${target} `);
    callback && callback();
  });
}

module.exports = {
  cloneRepo
};
