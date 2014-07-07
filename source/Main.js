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
    res.json({ 'searchResult': eventBriteApi.convertReceivedData(data) });
  }).fail(function (err) {
    console.log('[ERROR]|EB| search failed. \n', err, query);
    res.json({ 'error': err });
  });
});

app.get("/api/mu/getEvents", function(req, res) {
  console.log('[LOG]|MU| search events\n', req.query);

  meetUpApi.searchEvents(req.query).then(function (data) {
    console.log('[LOG]|MU| respose \n', data);
    res.json({ 'searchResult': meetUpApi.convertReceivedData(data) });
  }).fail(function (err) {
    console.log('[ERROR]|MU| search failed. \n', err, query);
    res.json({ 'error': err });
  });
});

app.get("/api/getEventsById", function(req, res) {
  console.log(req.query, util.meetUpPrefix);

  if (req.query.sourceType === util.eventBritePrefix) {
    eventBriteApi.getEvent(req.query, res).then(function (data) {
      lat = data.event.venue.latitude;
      lng = data.event.venue.longitude;

      var eventStartDate = new Date(data.event.start_date.split(" ")[0].split("-"));

      startDate = util.getPrettyDate(eventStartDate);
      eventStartDate.setDate(eventStartDate.getDate() + 7);
      endDate = util.getPrettyDate(eventStartDate);

      res.json({'searchResult': eventBriteApi.convertReceivedData({events: [null, data]}), 'center': {'lat': lat, 'lng': lng}, 'date': {'startDate': startDate, 'endDate': endDate}});
    }).fail(function (err) {
      console.log('[ERROR]|EB| get event by id failed. \n', err, query);

      res.json({'error': err});
    });
  } else if (req.query.sourceType === util.meetUpPrefix) {
    meetUpApi.getEvent(req.query, res);
  } else {
    res.json({});
  }
});

app.listen(argv.port);
console.log("## Serenedi started ##");
