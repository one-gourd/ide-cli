#!/usr/bin/env node

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const program = require('caporal');
const spawn = require('react-dev-utils/crossSpawn');

const path = require('path');
const { readFileOrEmpty, parseOrFalse, applyConfig } = require('./lib/util');
const installScriptConfig = require('./scripts/install/config');
const devScriptConfig = require('./scripts/dev/config');
const buildScriptConfig = require('./scripts/build/config');

const pkgFile = path.join(__dirname, '../package.json');
const pkgJson = parseOrFalse(readFileOrEmpty(pkgFile));

// ref: https://www.sitepoint.com/scaffolding-tool-caporal-js/
// bar.tick();};

const actionCreate = require('./scripts/create/');

const CMD_LIST = ['install', 'build', 'dev', 'test'];

const spawnCommand = scriptName => {
  // 获取参数
  const args = process.argv.slice(2);
  const scriptIndex = args.findIndex(x => !!~CMD_LIST.indexOf(x));
  const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

  if (scriptIndex === -1) {
    console.log('Unknown script "' + scriptName + '".');
    console.log('Perhaps you need to update ide-cli?');
    console.log(
      'See: https://facebook.github.io/create-react-app/docs/updating-to-new-releases'
    );
    return;
  }

  // 调用指定的脚本
  const result = spawn.sync(
    'node',
    nodeArgs
      .concat(require.resolve(`./scripts/${scriptName}/`))
      .concat(args.slice(scriptIndex + 1)),
    { stdio: 'inherit' }
  );
  if (result.signal) {
    if (result.signal === 'SIGKILL') {
      console.log(
        'The build failed because the process exited too early. ' +
          'This probably means the system ran out of memory or someone called ' +
          '`kill -9` on the process.'
      );
    } else if (result.signal === 'SIGTERM') {
      console.log(
        'The build failed because the process exited too early. ' +
          'Someone might have called `kill` or `killall`, or the system could ' +
          'be shutting down.'
      );
    }
    process.exit(1);
  }
  process.exit(result.status);
};

program
  .version(pkgJson.version || 'unknown')
  .description(pkgJson.description || 'ide 命令行工具')
  .command('create', 'Create new compoent - 创建新的 ide 模块')
  .argument('<jsonfile>', 'config json file - json 格式的配置文件')
  .option(
    '-l, --local',
    'not git clone repository - 不从远程拉取仓库（方便本地调试）'
  )
  .option('-d, --targetDir', 'target directory - 指定初始化的目标文件夹位置')
  .action(actionCreate);

applyConfig(program, installScriptConfig).action(() => {
  spawnCommand('install');
});

applyConfig(program, devScriptConfig).action(() => {
  spawnCommand('dev');
});

applyConfig(program, buildScriptConfig).action(() => {
  spawnCommand('build');
});

program.parse(process.argv);
