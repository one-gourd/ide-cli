'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  // throw err;
  console.log('error occur:', err);
});

// 参考官方：https://github.com/facebook/create-react-app/blob/main/packages/react-scripts/scripts/start.js

const fs = require('fs');
const chalk = require('react-dev-utils/chalk');
const program = require('caporal');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
// const clearConsole = require('react-dev-utils/clearConsole');
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls
} = require('react-dev-utils/WebpackDevServerUtils');
const openBrowser = require('react-dev-utils/openBrowser');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');

const paths = require('../../config/paths');
const configFactory = require('../../config/webpack.config');
const createDevServerConfig = require('../../config/webpackDevServer.config');

const { applyConfig } = require('../../lib/util');
const { printCLIVersion } = require('../../lib/infomations');
const cliConfig = require('./config');

const isInteractive = process.stdout.isTTY;
// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 9000;
const HOST = process.env.HOST || '0.0.0.0';

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.ideConfig])) {
  process.exit(1);
}

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log(
    `Learn more here: ${chalk.yellow('https://bit.ly/CRA-advanced-config')}`
  );
  console.log();
}

const { checkBrowsers } = require('react-dev-utils/browsersHelper');

function devProject(args, options, logger) {
  // 采用特殊的 port，需要调用 parseInt 将字符串转换成数字类型
  const defaultPort = parseInt(options.port || DEFAULT_PORT);

  printCLIVersion();

  if (defaultPort !== DEFAULT_PORT) {
    console.log(`指定开发端口：${defaultPort}`);
  }

  checkBrowsers(paths.appPath, isInteractive)
    .then(() => {
      // We attempt to use the default port but if it is busy, we offer the user to
      // run on a different port. `choosePort()` Promise resolves to the next free port.
      return choosePort(HOST, defaultPort);
    })
    .then(port => {
      if (port == null) {
        // We have not found a port.
        return;
      }
      const config = configFactory('development');
      const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
      const appName = require(paths.appPackageJson).name;
      const useTypeScript = fs.existsSync(paths.appTsConfig);

      const urls = prepareUrls(protocol, HOST, port);
      // Create a webpack compiler that is configured with custom messages.
      const compiler = createCompiler({
        appName,
        config,
        urls,
        useYarn: false,
        useTypeScript: false,
        webpack,
      });

      // Load proxy config
      const proxySetting = require(paths.appPackageJson).proxy;
      const proxyConfig = prepareProxy(proxySetting, paths.appPublic);
      // Serve webpack assets generated by the compiler over a web server.
      const serverConfig = createDevServerConfig(
        proxyConfig,
        urls.lanUrlForConfig
      );

      const devServer = new WebpackDevServer(compiler, serverConfig);

      // Launch WebpackDevServer.
      devServer.listen(port, HOST, err => {
        if (err) {
          return console.log(err);
        }

        console.log(chalk.cyan('Starting the development server...\n'));
        openBrowser(urls.localUrlForBrowser);
      });

      ['SIGINT', 'SIGTERM'].forEach(function(sig) {
        process.on(sig, function() {
          devServer.close();
          process.exit();
        });
      });
    })
    .catch(err => {
      if (err && err.message) {
        console.log(err.message);
      }
      process.exit(1);
    });
}

// 统一使用 caporal 进行包装
applyConfig(program, cliConfig, 'command').action(devProject);

program.parse(process.argv);
