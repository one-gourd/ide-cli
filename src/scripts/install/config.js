module.exports = {
  command: ['install', 'Install dependencies & devDependencies - 安装依赖'],
  option: [
    [
      '--use [installer]',
      'use specified npm to install - 比如 `--use tnpm` 表示使用 tnpm 去安装（加快安装速度），默认使用 npm'
    ],
    [
      '-a, --all',
      'install all dependencies - 安装 package.json 所有的依赖，包含（peerDependencies 依赖）'
    ]
  ]
};
