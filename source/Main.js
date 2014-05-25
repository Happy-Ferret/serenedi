var READ_SIZE = 100;

var path = require("path");
var express = require("express");
var app = express();
var eventbrite = require("eventbrite");
var util = require("./Util");
var argv = require('optimist').argv;
var eb_client = eventbrite({"app_key" : argv.eventbriteKey});
var Q = require('q');

app.use(express.static(path.join(__dirname, "../public")));
app.get("/", function (req, res) { res.redirect("../index.html"); });

app.get("/api/getEvents", function(req, res) {
  callEventSearch(buildEventSearchParam(req.query)).then(function (data) {
    res.json(data);
  }).fail(function (err) {
    console.log('[ERROR] event search failed. \n', err, req.query);
    res.json({'error': err});
  });
});

app.get("/api/getEventsById", function(req, res) {
  var lat, lng, startDate, endDate;

  callEventGet({'id': req.query.id, 'radius': Math.ceil(req.query.radius)}).then(function (data) {
    lat = data.event.venue.latitude;
    lng = data.event.venue.longitude;

    var eventStartDate = new Date(data.event.start_date.split(" ")[0].split("-"));
    
    startDate = util.getPrettyDate(eventStartDate);
    eventStartDate.setDate(eventStartDate.getDate() + 7);
    endDate = util.getPrettyDate(eventStartDate);

    return buildEventSearchParam({'lat': lat, 'lng': lng, 'radius': req.query.radius, 'dateFrom': startDate, 'dateTo': endDate, 'type': null});
  }).then(callEventSearch)
  .then(function (data) {
    data.center = {'lat': lat, 'lng': lng};
    data.date = {'startDate': startDate, 'endDate': endDate};

    res.json(data);
  }).fail(function (err) {
    console.log('[ERROR] get event by id failed. \n', err, req.query);
    res.json({'error': err});
  });
  // getEventsById(req.query, res);
});

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

var callEventSearch = function(param) {
  console.log('[LOG] search events\n', param);

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
  console.log('[LOG] get events\n', param);

  var deferred = Q.defer();
  eb_client.event_get(param, function(err, data) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
}

app.listen(argv.port);
console.log("## Serenedi started ##");
