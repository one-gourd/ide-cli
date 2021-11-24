const path = require('path');
const paths = require('./paths');

const { proxyLibs = [] } = require(paths.ideConfig);
const { proxyLabPathPrefix = '../' } = require(paths.ideConfig);
const { extraLibs = [] } = require(paths.ideConfig);
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');


const COMMON_EXTERNALS = {
  ette: {
    commonjs: 'ette',
    commonjs2: 'ette',
    amd: 'ette',
    root: 'Ette',
  },
  'ette-router': {
    commonjs: 'ette-router',
    commonjs2: 'ette-router',
    amd: 'ette-router',
    root: 'etteRouter',
  },
  'ette-proxy': {
    commonjs: 'ette-proxy',
    commonjs2: 'ette-proxy',
    amd: 'ette-proxy',
    root: 'etteProxy',
  },
  react: {
    commonjs: 'react',
    commonjs2: 'react',
    amd: 'react',
    root: 'React',
  },
  'react-is': {
    commonjs: 'react-is',
    commonjs2: 'react-is',
    amd: 'react-is',
    root: 'ReactIs',
  },
  'react-dom': {
    commonjs: 'react-dom',
    commonjs2: 'react-dom',
    amd: 'react-dom',
    root: 'ReactDOM',
  },
  antd: 'antd',
  mobx: 'mobx',
  'mobx-react': {
    commonjs: 'mobx-react',
    commonjs2: 'mobx-react',
    amd: 'mobx-react',
    root: 'mobxReact',
  },
  'mobx-react-lite': {
    commonjs: 'mobx-react-lite',
    commonjs2: 'mobx-react-lite',
    amd: 'mobx-react-lite',
    root: 'mobxReact',
  },
  'mobx-state-tree': {
    commonjs: 'mobx-state-tree',
    commonjs2: 'mobx-state-tree',
    amd: 'mobx-state-tree',
    root: 'mobxStateTree',
  },
  'styled-components': {
    commonjs: 'styled-components',
    commonjs2: 'styled-components',
    amd: 'styled-components',
    root: 'styled',
  },
  'ide-lib-utils': {
    commonjs: 'ide-lib-utils',
    commonjs2: 'ide-lib-utils',
    amd: 'ide-lib-utils',
    root: 'ideLibUtils',
  },
  'ide-model-utils': {
    commonjs: 'ide-model-utils',
    commonjs2: 'ide-model-utils',
    amd: 'ide-model-utils',
    root: 'ideModelUtils',
  },
  'ide-lib-base-component': {
    commonjs: 'ide-lib-base-component',
    commonjs2: 'ide-lib-base-component',
    amd: 'ide-lib-base-component',
    root: 'ideBaseComponent',
  },
  'ide-lib-engine': {
    commonjs: 'ide-lib-engine',
    commonjs2: 'ide-lib-engine',
    amd: 'ide-lib-engine',
    root: 'ideLibEngine',
  },
};

const extraLibArray = [].concat(extraLibs);
let otherExternalObj = {}; // 收集额外的 external 对象
let extraExtenalKeys = []; // 获取额外 externals keys
extraLibArray.forEach(lib => {
  if (typeof lib === 'object') {
    otherExternalObj = Object.assign({}, otherExternalObj, lib);
    extraExtenalKeys = extraExtenalKeys.concat(Object.keys(lib));
  } else if (typeof lib === 'string') {
    extraExtenalKeys.push(lib);
  }
});

const ALL_EXTERNALS = Object.assign(
  {},
  COMMON_EXTERNALS,
  {
    'react-dnd': {
      commonjs: 'react-dnd',
      commonjs2: 'react-dnd',
      amd: 'react-dnd',
      root: 'ReactDnD'
    },
    'react-dnd-html5-backend': {
      commonjs: 'react-dnd-html5-backend',
      commonjs2: 'react-dnd-html5-backend',
      amd: 'react-dnd-html5-backend',
      root: 'ReactDnDHTML5Backend'
    },
    'react-dnd-touch-backend': {
      commonjs: 'react-dnd-touch-backend',
      commonjs2: 'react-dnd-touch-backend',
      amd: 'react-dnd-touch-backend',
      root: 'ReactDnDTouchBackend'
    },
    'ss-tree': {
      commonjs: 'ss-tree',
      commonjs2: 'ss-tree',
      amd: 'ss-tree',
      root: 'ssTree'
    },
    'ide-code-editor': {
      commonjs: 'ide-code-editor',
      commonjs2: 'ide-code-editor',
      amd: 'ide-code-editor',
      root: 'ideCodeEditor'
    }
  },
  otherExternalObj
);

const COMMON_LIBS = Object.keys(COMMON_EXTERNALS);

// 使用 alias 解决基础包打包的问题，方便调试时修改
const ALIAS_LIBS = proxyLibs || [];
// 提取 alias keys ，因为有可能是 object 元素
const ALIAS_LIBS_KEYS = ALIAS_LIBS.map(lib => typeof lib === 'object' ? lib.name : lib);

const MAIN_FIELDS = ['idebug', 'browser', 'module', 'main'];


module.exports = {
  COMMON_EXTERNALS,
  getExternal: function(isProduction = false) {
    const libs = COMMON_LIBS.concat(extraExtenalKeys);
    const externals = {};
    libs.forEach(lib => {
      // 如果是 dev 状态，优先使用 alias 配置而不是 externals
      if (!isProduction && !!~ALIAS_LIBS_KEYS.indexOf(lib)) {
        process.env.NODE_ENV !== 'production' &&
          console.log(`依赖库 "${lib}" 优先使用 alias 配置`);
      } else {
        externals[lib] = isProduction
          ? ALL_EXTERNALS[lib]
          : (ALL_EXTERNALS[lib] && ALL_EXTERNALS[lib].root) || lib;
      }
    });

    // console.log('externals: ', externals);
    return externals;
  },
  getAlias: function() {
    const alias = {};
    ALIAS_LIBS.forEach(lib => {
      const isObj = typeof lib === 'object';
      const aliasName = isObj ? lib.name : lib;

      // 支持 proxyLabPathPrefix 配置项，不同的配置项情况不一样
      // 做一下兼容性，如果是绝对路径，则不需要进行 resolve
      let dirPath = '';
      if (isObj) {
        const libPath = lib['path'];
        dirPath = path.isAbsolute(libPath)
          ? libPath
          : paths.resolveApp(path.join(proxyLabPathPrefix, libPath));
      } else {
        dirPath = paths.resolveApp(path.join(proxyLabPathPrefix, lib));
      }

      if (!aliasName) {
        throw new Error('aliasName not exist!');
      }
      if (!dirPath) {
        throw new Error('dirPath not exist!');
      }
      alias[`${aliasName}$`] = dirPath;
    });

    return {
      alias,
      mainFields: MAIN_FIELDS,
      plugins: [
        new TsconfigPathsPlugin({
          mainFields: MAIN_FIELDS,
        }),
      ],
    };
  }
};
