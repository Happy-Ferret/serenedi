var Q = require('q');
var argv = require('optimist').argv;
var util = require('../shared/Util.js');

module.exports.searchEvents = function(req, res) {

};

module.exports.getEvent = function(req, res) {

};

var callEventSearch = function(param) {
  console.log('[LOG]|EB| search events\n', param);

};

var callEventGet = function(param) {
  console.log('[LOG]|EB| get events\n', param);

};

module.exports.buildEventSearchParam = function(args) {
  return {
    'lat': args.lat,
    'lon': args.lng,
    'radius': util.kmToMile(args.radius),
    'time': (new Date(args.dateFrom)).getTime() + ',' + (new Date(args.dateTo)).getTime(),
    'key': argv.meetupAPIKey
  };
};

module.exports.convertReceivedData = function(data) {

};
