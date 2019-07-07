
var parseArgs = require('minimist')

function parseArgv(argv = process.argv) {
    return parseArgs(argv.slice(2))
}

module.exports = {
    parseArgv
}