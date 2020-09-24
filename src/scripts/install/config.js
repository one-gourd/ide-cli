module.exports = {
  command: ['install', 'Install dependencies & devDependencies - 安装依赖'],
  option: [
    [
      '--use [installer]',
      'use specified npm to install - 比如 `--use tnpm` 表示使用 tnpm 去安装（加快安装速度），默认使用 npm',
    ],
    [
      '--scope [type]',
      'install what kind of dependencies, which type is "peer"(default), "workbox" - 安装哪种类型的依赖包（type 可选值 ["peer", "workbox"]），默认是安装 peerDependencies 依赖',
    ],
    [
      '-l, --local',
      'install local - 以本地方式安装，默认是全局安装（自动link）方式',
    ],
  ],
};
