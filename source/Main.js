var READ_SIZE = 100;

var path = require("path");
var express = require("express");
var app = express();
var eventbrite = require("eventbrite");
var util = require("./Util");
var argv = require('optimist').argv;
var eb_client = eventbrite({"app_key" : argv.eventbriteKey});
var q = require('q');

app.use(express.static(path.join(__dirname, "../public")));
app.get("/", function (req, res) { res.redirect("../index.html"); });

app.get("/api/getEvents", function(req, res) {
  getEvents(buildEventSearchParam(req.query), res);
});

app.get("/api/getEventsById", function(req, res) {
  getEventsById(req.query, res);
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

var getEvents = function(param, res) {
  console.log('[LOG] get events\n', param);

  eb_client.event_search(param, function(err, data) {
    if (err || !data) {
      console.log('[ERROR] event search failed. \n', err);
      return;
    }
    res.json(data);
  });
};

var getEventsById = function(args, res) {
  var param = {
    'id': args.id,
    'radius': Math.ceil(args.radius)
  };
  console.log('[LOG] get events by id\n', param);
  
  eb_client.event_get(param, function(err, data) {
    if (err || !data) {
      console.log('[ERROR] get event failed. \n', err, data);
      return;
    }

    var lat = data.event.venue.latitude;
    var lng = data.event.venue.longitude;

    var startDate = data.event.start_date.split(" ")[0].split("-");
    var endDate = new Date(startDate);

    startDate = startDate[1] + "/" + startDate[2] + "/" + startDate[0];

    endDate.setDate(endDate.getDate() + 7);
    var endDateMonth = endDate.getMonth() + 1;
    if (endDateMonth < 10) {
      endDateMonth = "0" + endDateMonth;
    }
    var endDateDay = endDate.getDate();
    if (endDateDay < 10) {
      endDateDay = "0" + endDateDay;
    }
    endDate = endDateMonth + "/" + endDateDay + "/" + endDate.getFullYear();

    var param = buildEventSearchParam(lat, lng, args.radius, startDate, endDate);
    console.log('[LOG] get events\n', param);

    eb_client.event_search(param, function(err, data) {
      data.center = {'lat': lat, 'lng': lng};
      data.date = {'startDate': startDate, 'endDate': endDate};

      res.json(data);
    });
  });
};

app.listen(argv.port);
console.log("## Serenedi started ##");
