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
