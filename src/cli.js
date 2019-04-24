#!/usr/bin/env node

const program = require('caporal');
const creatDirectory = require('./actions/create-directory');
const path = require('path');
const { readFileOrEmpty, parseOrFalse } = require('./util');

const pkgFile = path.join(__dirname, '../package.json');
const pkgJson = parseOrFalse(readFileOrEmpty(pkgFile));

// ref: https://www.sitepoint.com/scaffolding-tool-caporal-js/
// bar.tick();};

program
  .version(pkgJson.version || 'unknown')
  .description(pkgJson.description || 'ide 命令行工具')
  .command('create', 'create - 创建新的 ide 模块')
  .argument('<jsonfile>', 'config json file - json 格式的配置文件')
  .option(
    '-l, --local',
    'not git clone repository - 不从远程拉取仓库（方便本地调试）'
  )
  .action(creatDirectory);

program.parse(process.argv);
