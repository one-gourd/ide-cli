// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const chalk = require('react-dev-utils/chalk');
const spawn = require('react-dev-utils/crossSpawn');

const fs = require('fs');

const Package = require('../../lib/package');
const { applyConfig, isTrue, printCLIVersion } = require('../../lib/util');
const cliConfig = require('./config');

const program = require('caporal');

const die = message => console.error(chalk.bold.red(message));
const warn = message => console.warn(chalk.yellow(message));

const INSTALLERS = ['npm', 'tnpm', 'cnpm'];

// workbox 相关依赖，参考 https://developers.google.com/web/tools/workbox/modules
const WORKBOX_DEPS = [
  'workbox-cacheable-response','workbox-broadcast-update','workbox-cacheable-response','workbox-core','workbox-expiration','workbox-google-analytics','workbox-navigation-preload','workbox-precaching','workbox-range-requests','workbox-routing','workbox-strategies',
];

const validInstaller = (installer) => {
  // 校验安装器合法性

  const isValid = !!~INSTALLERS.indexOf(installer);
  if (!isValid) {
    die(
      `npm installer is invalid, please pick one from "${INSTALLERS.join(
        '", "'
      )}"`
    );
  }
  
  return isValid;
}

// 选择是以本地方式安装，还是以全局方式安装，默认是全局 + link
const installpkgs = (packages, installer = 'npm', useLocal = false) => {
  let result = { status: 0 };

  if (useLocal) {
    result = spawn.sync(installer, ['install'].concat(packages), {
      stdio: 'inherit',
    });
  } else {
    // 先全局安装
    result = spawn.sync(installer, ['install', '-g'].concat(packages), {
      stdio: 'inherit',
    });

    // 再进行 link
    result = spawn.sync(installer, ['link'].concat(packages), {
      stdio: 'inherit',
    });
  }
  return result;
};

// 安装所有依赖
function installPeers(args, options, logger) {
  const installer = options.use || 'npm'; // 默认使用 npm 安装，内网通过 `--use tnpm` 指定提示速度

  const useLocal = isTrue(options.local);

  // 校验有效性
  if(!validInstaller) return;

  fs.readFile('package.json', 'utf-8', function(error, contents) {
    if (contents === undefined) {
      return die("There doesn't seem to be a package.json here");
    }
    let packageContents = new Package(contents);
    if (!packageContents.isValid()) {
      return die('Invalid package.json contents');
    }
    if (!packageContents.hasPeerDependencies()) {
      return warn("This package doesn't seem to have any peerDependencies");
    }
    let peerDependencies = packageContents.peerDependencies;
    let packages = Object.keys(peerDependencies).map(function(key) {
      return `${key}@${peerDependencies[key]}`;
    });

    if (!packages.length) {
      return warn('This package seem to have zero peerDependencies, exit');
    }
    let peerInstallOptions = packageContents.peerInstallOptions;
    peerInstallOptions['save'] = false;

    console.log(
      chalk.green(
        `install peers[${useLocal ? 'local' : 'global'}]: ${packages.join(' ')}`
      )
    );

    const result = installpkgs(packages, installer, useLocal);
    process.exit(result.status);
  });
}

// 安装 workbox 相关依赖，全局安装，然后进行 link 操作
function installWorkbox(args, options, logger) {
  const installer = options.use || 'npm';

  // 安装方式：推荐在本地全局安装 + link 方式；
  // 在服务端用普通的本地方式，需要让该选项为 true
  const useLocal = isTrue(options.local);

  if (!validInstaller) return;

  console.log(chalk.green(`install workbox deps[${useLocal ? 'local' : 'global'}]...`));

  const result = installpkgs(WORKBOX_DEPS, installer, useLocal);
  process.exit(result.status);

}


// install 相关命令
function installScript(args, options, logger) {
  // 默认安装 peers 依赖
  const installerType = options.scope || 'peers';

  printCLIVersion();

  switch (installerType) {
    case 'peers':
      installPeers(args, options, logger);
      break;

    case 'workbox':
      installWorkbox(args, options, logger);
      break;

    default:
      break;
  }
}

// 统一使用 caporal 进行包装
applyConfig(program, cliConfig, 'command').action(installScript);

program.parse(process.argv);
