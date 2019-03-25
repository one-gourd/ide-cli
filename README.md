## ide-component-cli

用于 ide 的 component（模块）脚手架生成工具

## 安装

安装：
```shell
npm install -g ide-component-cli
```

获取帮助：
```shell
> ide-cli --help

ide-cli 0.1.0 - ide 命令行工具集

   USAGE

     ide-cli create <jsonfile>

   ARGUMENTS

     <jsonfile>      config json file - json 格式的配置文件      required

   OPTIONS

     -l, --local      not git clone repository - 不从远程拉取仓库（方便本地调试）      optional      default: false

   GLOBAL OPTIONS

     -h, --help         Display help
     -V, --version      Display version
     --no-color         Disable colors
     --quiet            Quiet mode - only displays warn and error messages
     -v, --verbose      Verbose mode - will also output debug messages
```

## 使用

想要使用，需要创建一个 .json 配置文件，比如创建名为 `ide-switch-panel` 的组件，创建名为 `config.json`（文件名随意，只要是 json 格式就行），文件内容如下（参考 [demo/config.json](./demo/config.json)）：
```js
{
    "name": "ide-switch-panel",
    "debugName": "switch-panel",
    "className": "SwitchPanel",
    "repo": "https://github.com/alibaba-paimai-frontend/ide-switch-panel.git",
    "homepage": "https://alibaba-paimai-frontend.github.io/ide-switch-panel",
    "idPrefix": "ssp",
    "version": "0.1.0",
    "description": "switch panel of ide",
    "author": "boycgit",
    "libName": "ideSwitchPanel",
    "externals": [
        "ide-code-editor"
    ]
}
```
> 注意：所有字段是区分大小写的，所以不要把 `className` 写成 `classname`

然后执行以下命令：

```shell
DEBUG=cli:* ide-cli create config.json
```
就能获得名为 `ide-switch-panel` 模块的脚手架了文件，就可以在此基础上进行开发。

## 配置文件说明

上述的 config.json 文件的字段各含义可以在 [_variables.js](./src/actions/_variables.js) 中找到，里面有详细的注释。

这里罗列一下必填项：
 - `name`: npm 包名，也是文件夹名
 - `className`: 类名，React 组件的名称，很重要
 - `idPrefix`: 用于区分组件 store 的 id 前缀，一般用缩写，比如 `SwitchPanel` 组件，就取 `ssp`，表明 "Store of Switch Panel"，当然可以随意取自己喜欢的，不要为空就行。
 - `debugName`: 用于 debug 的标识符，方便 debug 的，不要为空就可以
 - `libName`: 用于 umd webpack 的打包配置中的 `library` 字段，通常用在别人引用你的组件且 externals 时，就会用上该字段；




