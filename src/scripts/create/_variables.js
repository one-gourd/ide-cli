/*
 * Variables to replace
 * --------------------
 * They are asked to the user as they appear here.
 * User input will replace the placeholder  values
 * in the template files
 */

module.exports = [
  /**
   * npm 包名，也是文件夹名
   * 必填项
   */
  'name',

  /**
   * debugName，用于 debug 的标识符
   * 必填项
   */
  'debugName',

  /**
   * className，类名
   * 必填项
   */
  'className',

  /**
   * fnName, 导出的函数名
   * 必填项
   */
  'fnName',

  /**
   * store id 前缀
   * 必填项
   */
  'idPrefix',

  /**
   * npm version
   * 默认值：0.1.0
   */
  'version',

  /**
   * git 仓库地址
   */
  'repo',

  /**
   * gh-pages 对应的 homepage
   */
  'homepage',

  /**
   * npm description
   *
   */
  'description',

  /**
   * npm author
   */
  'author',

  /**
   * npm peerDependencies
   */
  'peer',

  /**
   * webpack umd library name，
   * 必填项
   */
  'libName',

  /**
   * webpack extra externals，会和上述的 peer 配置进行合并
   */
  'externals',
];
