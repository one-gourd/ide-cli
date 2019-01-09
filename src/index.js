const clone = require('git-clone');
const { invariant } = require('./util');
const { debugMini } = require('./debug');

const TPL_REPO_URL =
  'https://github.com/alibaba-paimai-frontend/ide-tpl-component.git';

function cloneRepo(target, callback) {
  invariant(!!target, '必须传入目录地址');
  debugMini(`开始拉取远程仓库：${TPL_REPO_URL}`);
  clone(TPL_REPO_URL, target, function() {
      debugMini(`成功拉取到本地，文件夹重命名为 ${target} `);
    callback && callback();
  });
}

module.exports = {
  cloneRepo
};
