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
    isTrue
} = require('../../lib/util');
const variables = require('./_variables');
const shell = require('shelljs');
const { cloneRepo } = require('./cloneRepo');

/**
 * 根据配置项，获取替换字符串
 * note: 默认 shell.sed 只会替换一处，可以使用正则 ‘/g’ 来达到目的，详见：[using sed to replace just the first occurrence of a string](https://github.com/shelljs/shelljs/issues/813)
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
            result = JSON.stringify(resultExternal)
                .replace('{', '')
                .replace('}', ','); // 重新揉成 peer 对象
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
function replaceFiles(targetDirection, configs, logger) {
    invariant(
        isExistFile(targetDirection),
        `目标文件夹 ${targetDirection} 不存在！`,
        logger
    );

    shell.cd(targetDirection); // 切换到当前文件
    // Replace variable values in all files

    // 删除 .git 隐藏目录
    shell.rm('-rf', '.git');

    // 获取字符串替换映射表
    const replaceMap = {};
    variables.forEach(variable => {
        replaceMap[variable] = {
            regexp: new RegExp(escapeRegex(`[${variable.toUpperCase()}]`), 'g'),
            replacement: getReplaceString(configs, variable)
        };
    });

    console.log(`\n>>> STEP 1: 重命名文件(夹) <<<`);
    // replace folder or file name
    ['name', 'className', 'version'].forEach(variable => {
        shell.exec(
            `${path.join(
                __dirname,
                '../../..'
            )}/node_modules/.bin/renamer -v --find "[${variable.toUpperCase()}]" --replace "${
            replaceMap[variable].replacement
            }" "**" | awk '/✔︎/'`
        );
    });

    console.log(`\n>>> STEP 2: 文件内容替换映射表： <<<`);

    shell.ls('-Ral').forEach(entry => {
        if (entry.isFile()) {
            // Replace '[VARIABLE]` with the corresponding variable value from the prompt
            debugMini(`>>>替换 ${entry.name} 文件内容 <<<`);
            variables.forEach(variable => {
                // debugMini(` --- [${variable.toUpperCase()}]`);
                shell.sed(
                    '-i',
                    replaceMap[variable].regexp,
                    replaceMap[variable].replacement,
                    entry.name
                );
            });
            // This one is just to replace[YEAR] occurrences with the current year.Useful for LICENSE or README.md files.
            // Insert current year in files
            shell.sed('-i', '\\[YEAR\\]', new Date().getFullYear(), entry.name);

            /**
             * 针对有子组件的情况，需要对 [SUBCOMP_START] 或 [SUBCOMP_END] 做特殊操作
             */
            removeBlockOrNot(entry.name, 'SUBCOMP', !isTrue(configs.hasSubComponents));
        }
    });

    /* ----------------------------------------------------
      替换 peerDependencies 依赖项
  ----------------------------------------------------- */
    const pkgFile = path.join(targetDirection, 'package.json');
    if (isExistFile(pkgFile)) {
        const pkgJson = parseOrFalse(readFileOrEmpty(pkgFile));
        if (pkgJson) {
            const peerObject = pkgJson.peerDependencies || {};
            const peerList = Object.keys(peerObject).map(name => {
                return `${name}@${peerObject[name]}`;
            });

            const shouldExternalEditor = !!peerObject['ide-code-editor'];

            if (peerList.length) {
                const peerStr = peerList.join(' ');
                const PEERLIST_VAR = 'peerList';
                console.log(
                    `\n STEP 3: [${PEERLIST_VAR.toUpperCase()}] ====> ${peerStr}`
                );

                if (shouldExternalEditor) {
                    console.log(`\n 因有 ide-code-editor 依赖，处理相应 html 标签`);
                }

                replaceMap[PEERLIST_VAR] = {
                    regexp: new RegExp(
                        escapeRegex(`[${PEERLIST_VAR.toUpperCase()}]`),
                        'g'
                    ),
                    replacement: peerStr
                };
                shell.ls('-Ral').forEach(entry => {
                    if (entry.isFile()) {
                        // debugMini(`>>> 替换 ${entry.name} 文件内容 <<<`);
                        // Replace '[VARIABLE]` with the corresponding variable value from the prompt
                        variables.forEach(variable => {
                            shell.sed(
                                '-i',
                                replaceMap[PEERLIST_VAR].regexp,
                                replaceMap[PEERLIST_VAR].replacement,
                                entry.name
                            );
                        });

                        /**
                         * 针对 ide-code-editor 的 externals，需要对 [EDITOR_START] 或 [EDITOR_END] 做特殊操作
                         */
                        removeBlockOrNot(entry.name, 'EDITOR', !shouldExternalEditor);
                    }
                });
            }
        }
    }
    // =============


    // 生成 ide.config.js 文件
    console.log(`\n>>> STEP 4: 生成 ide.config.js 文件： <<<`);
    const ideConfigFile = path.join(targetDirection, 'ide.config.js');
    writeFileOrNone(ideConfigFile, 'module.exports = ' + JSON.stringify(configs, (key, value) => {
        // 需要忽略一些 npm 相关的信息
        if (!!~['version', 'homepage', 'repo', 'description', 'author'].indexOf(key)) {
            return undefined;
        }
        return value;
    }, 4));
}

/**
 * 通过 tag 来整体删除或保留
 *
 * @param {*} filepath
 * @param {*} tag
 * @param {*} shouldRemoveBlock
 */
function removeBlockOrNot(filepath, tag, shouldRemoveBlock) {
    if (!filepath || !tag) return;
    if (shouldRemoveBlock) {
        shell.exec(
            `sed -i '/${escapeRegex(`[${tag}_START]`)}/, /${escapeRegex(
                `[${tag}_END]`
            )}/ d' ${filepath}`
        );
    } else {
        shell.exec(
            `sed -i '/${escapeRegex(`([${tag}_START]|[${tag}_END])`)}/ d' ${
            filepath
            }`
        );

    }
}

module.exports = (args, options, logger) => {
    debugMini(`命令行 options: ${JSON.stringify(options)}`);

    const targetInitDir = options.targetDir || cwd; // 如果不指定目标文件夹，则使用 cwd

    // 读取 json 配置文件
    let jsonPath = path.resolve(targetInitDir, args.jsonfile);
    // console.log(1111, cwd, args.jsonfile);
    const configs = parseOrFalse(readFileOrEmpty(jsonPath));
    invariant(!!configs, `${jsonPath} 文件内容为空，请检查`, logger);

    // 校验不能为空的属性
    ['name', 'debugName', 'className', 'idPrefix', 'libName'].forEach(keyname => {
        invariant(!!configs[keyname], `${keyname} 属性不能为空`, logger);
    });

    // 重新调整 config 中的 externals 格式为 [{'ss-tree': '1.2.x'},...]
    configs.externals = [].concat(configs.externals || []).map(external => {
        if (typeof external === 'object') {
            return external;
        } else {
            const result = {};
            result[external] = 'x.x.x';
            return result;
        }
    });

    debugExtra(`====> config 内容 ${JSON.stringify(configs, null, 4)}`);

    const targetDirection = path.join(targetInitDir, configs.name);
    debugMini(`目标文件夹：${targetDirection}`);

    if (options.local) {
        debugMini(`不拉取远程仓库，本地替换`);
        replaceFiles(targetDirection, configs, logger);
    } else {
        // 克隆到目标文件夹
        cloneRepo(targetDirection, () => {
            replaceFiles(targetDirection, configs, logger);
        }, configs.templater);
    }
};
