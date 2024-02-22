const chalk = require('react-dev-utils/chalk');
const { cliPkgJSON } = require('../config/paths');

function printCLIVersion() {
  console.log('IDE-CLI VERISON:', chalk.green(cliPkgJSON.version));
}

module.exports = {
  printCLIVersion,
};
