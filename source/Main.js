var path = require("path");
var express = require("express");
var argv = require('optimist').argv;
var eventBriteApi = require('./EventBriteApi.js');
var meetUpApi = require('./MeetUpApi.js');
var app = express();

app.use(express.static(path.join(__dirname, "../public")));
app.get("/", function (req, res) { res.redirect("../index.html"); });

app.get("/api/eb/getEvents", function(req, res) {
  eventBriteApi.searchEvents(req, res);
});

app.get("/api/mu/getEvents", function(req, res) {
  meetUpApi.searchEvents(req, res);
});

app.get("/api/getEventsById", function(req, res) {
  eventBriteApi.getEvent(req, res);
});

app.listen(argv.port);
console.log("## Serenedi started ##");
