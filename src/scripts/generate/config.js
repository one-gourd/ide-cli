module.exports = {
  command: [
    'generate',
    'generate from tpl - 基于 generate-template-files 创建, 比 create 命令更具有扩展性',
  ],
  argument: ['<jsonfile>', 'config json file - json 格式的配置文件'],
  option: [
    // [
    //   '-l, --local',
    //   'use local template dir - 使用本地模板文件夹（而不是从远程拉取）',
    // ],
    ['-d, --targetDir', 'target directory - 指定目标文件夹位置'],
  ],
};
