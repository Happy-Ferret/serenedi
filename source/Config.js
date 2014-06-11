var fs = require("fs");
var optimist = require("optimist");
var path = require("path");
var argv = optimist.argv;
var home = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];

var config = {
  testTimeout: 10000,
  serverTimeout: 10000
};

if (!argv || !argv.port || !argv.eventbriteAPIkey || !argv.url) {
  var configFile = fs.readFileSync(path.join(home + "/.serenedirc"), "utf-8");
  if (!configFile) {
    throw new Error("Missing .serenedirc");
  }
  else {
    configFile = JSON.parse(configFile);
  }
}

config.port = argv.port || configFile.port;
config.eventbriteAPIkey = argv.eventbriteAPIkey || configFile.eventbriteAPIkey;
config.launch = argv.launch === undefined ? true : argv.launch;
config.googleAPIKey = argv.googleAPIKey || configFile.googleAPIKey;
config.url = argv.url || configFile.url;
module.exports = config;

if (argv.help) {
  optimist.usage('Launch Serenedi: Location based event search web application.')
    .describe('port', 'Serenedi\'s port number')
    .describe('url', 'URL where Serenedi is hosted on. (includes port number, ex. [--url=127.0.0.1:80])')
    .describe('launch', 'to launch Serenedi on start or not.')
    .describe('googleAPIKey', 'Google API key');

  optimist.showHelp();
  process.exit(0);
}
