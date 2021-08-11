module.exports = {
  command: ['create', 'Create new component - 创建新的 ide 模块'],
  argument: ['<jsonfile>', 'config json file - json 格式的配置文件'],
  option: [
    [
      '-l, --local',
      'not git clone repository - 不从远程拉取仓库（方便本地调试）',
    ],
    ['-d, --targetDir', 'target directory - 指定初始化的目标文件夹位置'],
  ],
};
