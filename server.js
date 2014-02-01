#!/usr/bin/env node
var startLaunchTime = Date.now();
var forever = require('forever-monitor');
var open = require('open');
var path = require('path');
var child_process = require('child_process');
var async = require('async');
var fs = require("fs");
var argv = require('optimist').argv;
var config = require("./source/Config").config;

function launch(callback) {
  console.log('Browse to ' + config.url);
  open(config.url);
}

function startupListener(data) {
  if (data.toString().indexOf('## Serenedi started ##') >= 0) {
    if (config.launch) {
      launch(function(err) {
        if (err) console.log(err);
      });
    }
    child.removeListener('stdout', startupListener);
    var launchTime = (Date.now() - startLaunchTime);
    console.log('Took ' + launchTime + 'ms to start server.');
  }
}

var child = new (forever.Monitor)(path.join(__dirname, './source/', 'Main.js'), {
  silent: false,
  minUptime: 2000,
  max: config.maxNAutoRestartOnCrash,
  cwd: path.join(process.cwd(), '..'),
  options:  ['--port=' + config.port, 
                  '--eventbriteKey=' + config.eventbriteAPIkey],
  env: { LANG: 'en_US', LC_ALL: 'C' }
});

child.on('exit', function (res) {
  console.log('Stopped keeping serenedi alive');
});
child.on('stdout', startupListener);
child.start();