#!/usr/bin/env node

const program = require('caporal');
const creatDirectory = require('./actions/create-directory');

// ref: https://www.sitepoint.com/scaffolding-tool-caporal-js/
// bar.tick();};

program
  .version('0.1.0')
  .description('ide 命令行工具集')
  .command('create', 'create - 创建新的 ide 组件')
  .argument('<jsonfile>', 'config json file - json 格式的配置文件')
  .option('-l, --local', 'not git clone repository - 不从远程拉取仓库（方便本地调试）')
  .action(creatDirectory);

program.parse(process.argv);
