var Q = require('q');
var argv = require('optimist').argv;
var util = require('../shared/Util.js');
var eventbrite = require("eventbrite");
var eb_client = eventbrite({"app_key" : argv.eventbriteKey});

var READ_SIZE = 100;

module.exports.searchEvents = function(query, res) {
  callEventSearch(buildEventSearchParam(query)).then(function (data) {
    console.log('[LOG]|EB| respose \n', data);
    res.json(module.exports.convertReceivedData(data));
  }).fail(function (err) {
    console.log('[ERROR]|EB| search failed. \n', err, query);
    res.json({'error': err});
  });
};

module.exports.getEvent = function(query, res) {
  var lat, lng, startDate, endDate;

  callEventGet({'id': query.id, 'radius': query.radius}).then(function (data) {
    lat = data.event.venue.latitude;
    lng = data.event.venue.longitude;

    var eventStartDate = new Date(data.event.start_date.split(" ")[0].split("-"));

    startDate = util.getPrettyDate(eventStartDate);
    eventStartDate.setDate(eventStartDate.getDate() + 7);
    endDate = util.getPrettyDate(eventStartDate);

    return buildEventSearchParam({'lat': lat, 'lng': lng, 'radius': query.radius, 'dateFrom': startDate, 'dateTo': endDate, 'type': null});
  }).then(callEventSearch)
  .then(function (data) {
    data.center = {'lat': lat, 'lng': lng};
    data.date = {'startDate': startDate, 'endDate': endDate};

    console.log('[LOG]|EB| respose \n', data);

    res.json(module.exports.convertReceivedData(data));
  }).fail(function (err) {
    console.log('[ERROR]|EB| get event by id failed. \n', err, query);

    res.json({'error': err});
  });
};

var callEventSearch = function(param) {
  console.log('[LOG]|EB| search events\n', param);

  var deferred = Q.defer();
  eb_client.event_search(param, function(err, data) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
};

var callEventGet = function(param) {
  console.log('[LOG]|EB| get events\n', param);

  var deferred = Q.defer();
  eb_client.event_get(param, function(err, data) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
};

var buildEventSearchParam = function(args) {
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

    event.id = data[n].event.id;
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

    events.push(event);
  }

  return events;
};
