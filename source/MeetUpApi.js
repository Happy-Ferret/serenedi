var Q = require('q');
var argv = require('optimist').argv;
var util = require('../shared/Util.js');
var http = require('http');

module.exports.searchEvents = function(req, res) {
  var self = this;
  http.request(this.buildEventSearchParam(req.query), function(httpRes) {
    httpRes.setEncoding('utf8');
    httpRes.on('data', function(data) {
      res.json(self.convertReceivedData(data));
    });
  }).end();
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
  var events = [];
  data = data.results;
  for (var n = 0; n < data.length; n++) {
    var event = {};
    var current = current;
    var startDate = new date(current.time);

    event.id = current.id;
    event.title = current.name;
    event.lat = current.venue && current.venue.lat ? current.venue.lat : current.group.group_lat;
    event.lng = current.venue && current.venue.lon ? current.venue.lon : current.group.group_lon;
    event.url = current.event_url;
    event.startDate = util.getPrettyDate(startDate);
    event.endDate = null;
    if (current.venue) {
      event.addr = current.venue.address_1 + ' ' + current.venue.address_2;
      event.city = current.venue.city;
      event.region = current.venue.state;
      event.zip = current.venue.zip;
    }
    event.category = current.group ? current.group.category : null;

    events.push(event);
  }

  return events;
};
