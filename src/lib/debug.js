const Debug = require('debug')
const debug = Debug('cli');
const debugMini = Debug('cli:mini');
const debugError = Debug('cli:error');
const debugExtra = Debug('cli:extra');

module.exports = {
    debug,
    debugMini,
    debugError,
    debugExtra
}