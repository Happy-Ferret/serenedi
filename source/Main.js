var path = require("path");
var express = require("express");
var argv = require('optimist').argv;
var eventBriteApi = require('./EventBriteApi.js');
var meetUpApi = require('./MeetUpApi.js');
var util = require('../shared/Util.js');
var app = express();

app.use(express.static(path.join(__dirname, "../public")));
app.get("/", function (req, res) { res.redirect("../index.html"); });

app.get("/api/eb/getEvents", function(req, res) {
  console.log('[EB] search events: ', req.query);

  eventBriteApi.searchEvents(req.query).then(function (received) {
    console.log('[EB] search response received', received);
    res.json(createSearchResult(eventBriteApi.convertReceivedData(received)));
  }).fail(function (err) {
    console.error('[EB] search failed: ', err, query);
    res.json({ 'error': err });
  });
});

app.get("/api/mu/getEvents", function(req, res) {
  console.log('[MU] search events: ', req.query);

  meetUpApi.searchEvents(req.query).then(function (received) {
    console.log('[MU] search respose received: ', received);
    res.json(createSearchResult(meetUpApi.convertReceivedData(received)));
  }).fail(function (err) {
    console.error('[MU] search failed: ', err, query);
    res.json({ 'error': err });
  });
});

app.get("/api/getEventsById", function(req, res) {
  var promise;

  if (req.query.sourceType === util.eventBritePrefix) {
    console.log('[EB] getEventById: ', req.query);
    promise = eventBriteApi.getEvent(req.query, res).then(function (received) {
      console.log('[EB] getEventById response received: ', received);
      lat = received.event.venue.latitude;
      lng = received.event.venue.longitude;

      var eventStartDate = new Date(received.event.start_date.split(" ")[0].split("-"));

      startDate = util.getPrettyDate(eventStartDate);
      eventStartDate.setDate(eventStartDate.getDate() + 7);
      endDate = util.getPrettyDate(eventStartDate);

      res.json(createSearchResult(eventBriteApi.convertReceivedData({events: [null, received]}), lat, lng, startDate, endDate));
    });
  } else if (req.query.sourceType === util.meetUpPrefix) {
    console.log('[MU] getEventById: ', req.query);
    promise = meetUpApi.getEvent(req.query, res).then(function(received) {
      console.log('[MU] getEventById response received: ', received);
      var lat = received.venue && received.venue.lat ? received.venue.lat : received.group.group_lat;
      var lng = received.venue && received.venue.lon ? received.venue.lon : received.group.group_lon;
      var startDate = util.getPrettyDate(new Date(received.time));
      var endDate = new Date(received.time);
      endDate.setDate(endDate.getDate() + 7);
      endDate = util.getPrettyDate(endDate);

      res.json(createSearchResult(meetUpApi.convertReceivedData({results: [received]}), lat, lng, startDate, endDate));
    });
  } else {
    res.json({});
    return;
  }

  promise.fail(function (err) {
    console.error('getEventById failed: ', err);
    res.json({'error': err});
  });
});

var createSearchResult = function(result, lat, lng, startDate, endDate) {
  var searchResult = {};
  searchResult.searchResult = result;

  if (lat && lng) {
    searchResult.center = {'lat': lat, 'lng': lng};
  }
  if (startDate && endDate) {
    searchResult.date = {'startDate': startDate, 'endDate': endDate};
  }
  return searchResult;
};

app.listen(argv.port);
console.log("## Serenedi started ##");
