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
const { applyConfig } = require('../../lib/util');
const cliConfig = require('./config');

const program = require('caporal');

const die = message => console.error(chalk.bold.red(message));
const warn = message => console.warn(chalk.yellow(message));

const INSTALLERS = ['npm', 'tnpm', 'cnpm'];
function installPeers(args, options, logger) {
  const installer = options.use || 'npm'; // 默认使用 npm 安装，内网通过 `--use tnpm` 指定提示速度
  if (!~INSTALLERS.indexOf(installer)) {
    return die(
      `npm installer is invalid, please pick one from "${INSTALLERS.join(
        '", "'
      )}"`
    );
  }
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

    const result = spawn.sync(installer, ['install', packages.join(' ')], {
      stdio: 'inherit'
    });
    process.exit(result.status);
  });
}

// 统一使用 caporal 进行包装
applyConfig(program, cliConfig, 'command').action(installPeers);

program.parse(process.argv);
