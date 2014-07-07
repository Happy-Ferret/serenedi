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
  console.log('[LOG]|EB| search events\n', req.query);

  eventBriteApi.searchEvents(req.query).then(function (data) {
    console.log('[LOG]|EB| respose \n', data);
    res.json(createSearchResult(eventBriteApi.convertReceivedData(data)));
  }).fail(function (err) {
    console.log('[ERROR]|EB| search failed. \n', err, query);
    res.json({ 'error': err });
  });
});

app.get("/api/mu/getEvents", function(req, res) {
  console.log('[LOG]|MU| search events\n', req.query);

  meetUpApi.searchEvents(req.query).then(function (data) {
    console.log('[LOG]|MU| respose \n', data);
    res.json(createSearchResult(meetUpApi.convertReceivedData(data)));
  }).fail(function (err) {
    console.log('[ERROR]|MU| search failed. \n', err, query);
    res.json({ 'error': err });
  });
});

app.get("/api/getEventsById", function(req, res) {
  console.log(req.query, util.meetUpPrefix);
  var promise;

  if (req.query.sourceType === util.eventBritePrefix) {
    promise = eventBriteApi.getEvent(req.query, res).then(function (data) {
      lat = data.event.venue.latitude;
      lng = data.event.venue.longitude;

      var eventStartDate = new Date(data.event.start_date.split(" ")[0].split("-"));

      startDate = util.getPrettyDate(eventStartDate);
      eventStartDate.setDate(eventStartDate.getDate() + 7);
      endDate = util.getPrettyDate(eventStartDate);

      res.json(createSearchResult(eventBriteApi.convertReceivedData({events: [null, data]}), lat, lng, startDate, endDate));
    });
  } else if (req.query.sourceType === util.meetUpPrefix) {
    promise = meetUpApi.getEvent(req.query, res).then(function(received) {
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
    console.log('[ERROR] get event by id failed. \n', err);

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
