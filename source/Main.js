var READ_SIZE = 100;

var path = require("path");
var express = require("express");
var util = require('../shared/Util.js');
var argv = require('optimist').argv;
var eventBriteApi = require('./EventBriteApi.js');
var app = express();

app.use(express.static(path.join(__dirname, "../public")));
app.get("/", function (req, res) { res.redirect("../index.html"); });

app.get("/api/getEvents", function(req, res) {
  eventBriteApi.callEventSearch(buildEventSearchParam(req.query)).then(function (data) {
    console.log('[LOG] respose \n', data);
    res.json(data);
  }).fail(function (err) {
    console.log('[ERROR] event search failed. \n', err, req.query);
    res.json({'error': err});
  });
});

app.get("/api/getEventsById", function(req, res) {
  var lat, lng, startDate, endDate;

  eventBriteApi.callEventGet({'id': req.query.id, 'radius': Math.ceil(req.query.radius)}).then(function (data) {
    lat = data.event.venue.latitude;
    lng = data.event.venue.longitude;

    var eventStartDate = new Date(data.event.start_date.split(" ")[0].split("-"));

    startDate = util.getPrettyDate(eventStartDate);
    eventStartDate.setDate(eventStartDate.getDate() + 7);
    endDate = util.getPrettyDate(eventStartDate);

    return buildEventSearchParam({'lat': lat, 'lng': lng, 'radius': req.query.radius, 'dateFrom': startDate, 'dateTo': endDate, 'type': null});
  }).then(eventBriteApi.callEventSearch)
  .then(function (data) {
    data.center = {'lat': lat, 'lng': lng};
    data.date = {'startDate': startDate, 'endDate': endDate};

    console.log('[LOG] respose \n', data);

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

app.listen(argv.port);
console.log("## Serenedi started ##");
