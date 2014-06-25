var Q = require('q');
var argv = require('optimist').argv;
var util = require('../shared/Util.js');
var http = require('http');

module.exports.searchEvents = function(req, res) {

};

module.exports.getEvent = function(req, res) {

};

var callEventSearch = function(param) {
  console.log('[LOG]|MU| search events\n', param);

};

var callEventGet = function(param) {
  console.log('[LOG]|MU| get events\n', param);

};

module.exports.buildEventSearchParam = function(args) {
  return {
    host: "https://api.meetup.com",
    port: "80",
    path: '/2/open_events.json' +
      '?lon=' + args.lng +
      '&lat=' + args.lat +
      '&radius=' + util.kmToMile(args.radius) +
      '&time=' +  (new Date(args.dateFrom)).getTime() + ',' + (new Date(args.dateTo)).getTime() +
      '&key=' + argv.meetupKey,
    method: "GET"
  };
};

module.exports.convertReceivedData = function(data) {

};
