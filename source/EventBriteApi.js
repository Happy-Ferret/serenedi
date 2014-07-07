var Q = require('q');
var argv = require('optimist').argv;
var util = require('../shared/Util.js');
var eventbrite = require("eventbrite");
var eb_client = eventbrite({"app_key" : argv.eventbriteKey});

var READ_SIZE = 100;

module.exports.searchEvents = function(query) {
  var param = module.exports.buildEventSearchParam(query);
  var deferred = Q.defer();

  eb_client.event_search(param, function(err, data) {
    if (err) {
      deferred.resolve({ events: [] });
    } else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
};

module.exports.getEvent = function(query) {
  var deferred = Q.defer();

  eb_client.event_get({'id': query.id}, function(err, data) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
};

module.exports.buildEventSearchParam = function(args) {
  return {
    'latitude': args.lat,
    'longitude': args.lng,
    "within_unit" : "K",
    "max" : READ_SIZE,
    "page" : 1,
    "within" : Math.ceil(args.radius),
    "date" : util.getEventbriteDateFormat(args.dateFrom) + " " + util.getEventbriteDateFormat(args.dateTo),
    "category" : util.getTypeString(args.type),
    "sort_by" : "id"
  };
};

module.exports.convertReceivedData = function(data) {
  var events = [];
  data = data.events;
  for (var n = 1; n < data.length; n++) {
    var event = {};

    event.id =  parseInt(data[n].event.id, 10);
    event.title = data[n].event.title;
    event.lat = data[n].event.venue.latitude;
    event.lng = data[n].event.venue.longitude;
    event.url = data[n].event.url;
    event.startDate = data[n].event.start_date.split(' ')[0];
    event.endDate = data[n].event.end_date.split(' ')[0];
    event.addr = data[n].event.venue.address + ' ' + data[n].event.venue.address_2;
    event.city = data[n].event.venue.city;
    event.region = data[n].event.venue.region;
    event.zip = data[n].event.venue.postalcode;
    event.category = data[n].event.category;
    event.type = util.eventBritePrefix;

    events.push(event);
  }

  return events;
};
