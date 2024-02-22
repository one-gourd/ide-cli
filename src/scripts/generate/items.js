const skipConfigName = [
  'local',
  'templater',
  'targetDir',
  'tplDir',
  'overwrite',
]; // 需要跳过过滤的字段
exports.getItems = (configs)=>{
    // 动态生成替换变量
    const dynamicReplacers = [];
    for (const keyName in configs) {
        if(!~skipConfigName.indexOf(keyName)) {
            dynamicReplacers.push({
                slot: `__${keyName}__`,
                slotValue: configs[keyName]
            })
        }
    }
    return [
      {
        option: 'IDE TPL',
        defaultCase: '(pascalCase)',
        entry: {
          folderPath: configs.tplDir,
        },
        dynamicReplacers: dynamicReplacers,
        output: {
          path: `${configs.targetDir}/__name__(noCase)`,
          pathAndFileNameDefaultCase: '(kebabCase)',
          overwrite: configs.overwrite,
        },
        onComplete: async (results) => {
          console.log(`results`, results);
        },
      },
    ];
};