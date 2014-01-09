var fs = require("fs");
var argv = require("optimist").argv;

var config = {
  testTimeout: 10000,
  serverTimeout: 10000,
  viewportSize: { width: 800, height: 1600 }
};
if (!argv || !argv.port || !argv.eventbriteAPIkey || !argv.url) {
  var configFile = fs.readFileSync(".serenedirc", "utf-8");
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
console.log(configFile);
config.url = argv.url || configFile.url;
exports.config = config;