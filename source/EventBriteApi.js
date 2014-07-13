var Q = require('q');
var util = require('../shared/Util.js');
var eventbrite = require("eventbrite");
var eb_client = eventbrite({"app_key" : require('optimist').argv.eventbriteKey});

var READ_SIZE = 100;
var getDeferred = function(param) {
  var d = Q.defer();

  var deferredCallBack = function(err, data) {
    if (err) {
      d.reject(err);
    } else {
      d.resolve(data);
    }
  };

  if (param.id) {
    eb_client.event_get(param, deferredCallBack);
  } else {
    eb_client.event_search(param, deferredCallBack);
  }

  return d;
};

module.exports.searchEvents = function(query) {
  return getDeferred(this.buildEventSearchParam(query)).promise;
};

module.exports.getEvent = function(query) {
  return getDeferred({'id': query.id}).promise;
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
    var current = data[n];

    event.id = current.event.id.toString();
    event.title = current.event.title;
    event.lat = current.event.venue.latitude;
    event.lng = current.event.venue.longitude;
    event.url = current.event.url;

    var startDate = current.event.start_date.split(' ')[0];
    if (startDate) {
      event.startDate = util.getPrettyDate(new Date(startDate));
    } else {
      event.startDate = null;
    }
    var endDate = current.event.end_date.split(' ')[0];
    if (endDate) {
      event.endDate = current.event.end_date.split(' ')[0];
    } else {
      event.endDate = null;
    }
    event.addr = current.event.venue.address + ' ' + current.event.venue.address_2;
    event.city = current.event.venue.city;
    event.region = current.event.venue.region;
    event.zip = current.event.venue.postalcode;
    event.category = current.event.category;
    event.type = util.eventBritePrefix;

    events.push(event);
  }

  return events;
};
