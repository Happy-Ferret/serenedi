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
  eventBriteApi.searchEvents(req.query, res);
});

app.get("/api/mu/getEvents", function(req, res) {
  meetUpApi.searchEvents(req.query, res);
});

app.get("/api/getEventsById", function(req, res) {
  console.log(req.query, util.meetUpPrefix);

  if (req.query.sourceType === util.eventBritePrefix) {
    eventBriteApi.getEvent(req.query, res);
  } else if (req.query.sourceType === util.meetUpPrefix) {
    meetUpApi.getEvent(req.query, res);
  } else {
    res.json({});
  }
});

app.listen(argv.port);
console.log("## Serenedi started ##");
