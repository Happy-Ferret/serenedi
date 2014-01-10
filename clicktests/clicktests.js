
var expect = require('expect.js');
var helpers = require('./configuredHelpers');
var server;

var backgroundAction = function(method, url, callback) {
  var tempPage = helpers.createPage(function(err) {
    console.error('Caught error');
    phantom.exit(1);
  });
  tempPage.open(url, method, function(status) {
    if (status == 'fail') return callback({ status: status, content: tempPage.plainText });
    tempPage.close();
    callback();
  });
};


var page = helpers.createPage(function(err) {
  console.error('Caught error');
  phantom.exit(1);
});

var test = helpers.test;

test('Init', function(done) {
  server = helpers.startSerenediServer(done);
});

test('Open home screen', function(done) {
  page.open('http://localhost:' + helpers.config.port, function() {
    helpers.waitForElement(page, '#menuContainer', function() {
      done();
    });
  });
});

test('Stop the server', function(done) {
  console.log(server.pid);
  server.kill('SIGINT');
  phantom.exit(0);
  done();
});

helpers.runTests(page);

