const path = require('path');
const cwd = process.cwd();
const { debugMini, debugExtra } = require('../../lib/debug');
const {
  readFileOrEmpty,
  parseOrFalse,
  invariant,
  escapeRegex,
  isExistFile,
  writeFileOrNone,
  applyConfig,
} = require('../../lib/util');
const { printCLIVersion } = require('../../lib/infomations');

const shell = require('shelljs');
const { cloneRepo } = require('../../lib/cloneRepo');
const { generateTemplateFilesBatch } = require('generate-template-files');

const cliConfig = require('./config');

const program = require('caporal');
const {getItems} = require('./items')


const generateFiles = (configs, logger) => {

    shell.cd(configs.tplDir); // 切换到当前文件

    // 删除 .git 隐藏目录
    shell.rm('-rf', '.git');

    const items = getItems(configs);
    generateTemplateFilesBatch(items);
}


const actionGenerate = (args, options, logger) => {

    printCLIVersion();
    
    debugMini(`命令行 options: ${JSON.stringify(options)}`);

    const targetInitDir = !!options.targetDir ? path.join(cwd, options.targetDir)  : cwd; // 如果不指定目标文件夹，则使用 cwd

    // 读取 json 配置文件
    let jsonPath = path.resolve(cwd, args.jsonfile);

    const configs = parseOrFalse(readFileOrEmpty(jsonPath));
    invariant(!!configs, `${jsonPath} 文件内容为空，请检查`, logger);

    // 校验不能为空的属性
    ['name', 'templater'].forEach((keyname) => {
      invariant(!!configs[keyname], `${keyname} 属性不能为空`, logger);
    });

    debugExtra(`====> config 内容 ${JSON.stringify(configs, null, 4)}`);

    // 设置生成文件夹地址
    configs.targetDir = targetInitDir;

    if (configs.local) {
        configs.tplDir = path.join(cwd, configs.templater);
        debugMini(`不拉取远程仓库，使用本地的`);
        generateFiles(configs, logger);
    } else {
      configs.tplDir = path.join(targetInitDir, '.templates');
      invariant(
        configs.templater.indexOf('http') === 0,
        `远程模板地址 ${configs.templater} 不正确，如果使用本地请配置 local: true`,
        logger
      );
      // 克隆到目标文件夹
      cloneRepo(
        configs.tplDir,
        () => {
          generateFiles(configs, logger);
        },
        configs.templater
      );
    }

    // 先进入目标文件夹进行预处理 - 比如删除 .git 等目录
    debugMini(`模板文件夹所在地：${configs.tplDir}`);
};


// 统一使用 caporal 进行包装
applyConfig(program, cliConfig, 'command').action(actionGenerate);

program.parse(process.argv);
