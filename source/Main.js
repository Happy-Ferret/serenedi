var READ_SIZE = 100;

var path = require("path");
var express = require("express");
var app = express();
var eventbrite = require("eventbrite");
var util = require("./Util");
var argv = require('optimist').argv;
var io = require("socket.io").listen(app.listen(argv.port));
var eb_client = eventbrite({"app_key" : argv.eventbriteKey});

app.use(express.static(path.join(__dirname, "../public")));
app.get("/", function (req, res) { res.redirect("../index.html"); });

io.sockets.on("connection", function(socket) {
  socket.on("getEventsCall", function(data) {
    var params = {"longitude": data.message.lng,
      "latitude" : data.message.lat,
      "within_unit" : "K",
      "max" : READ_SIZE,
      "page" : 1,
      "within" : Math.ceil(data.message.radius),
      "date" : util.getEventbriteDateFormat(data.message.dateFrom) + " " + util.getEventbriteDateFormat(data.message.dateTo),
      "category" : util.getTypeString(data.message.type),
      "sort_by" : "id"};

    eb_client.event_search(params, function(err, data) {
      socket.emit("getEventsResult", {message : data});
    });
  });

  socket.on("getEventsByIDCall", function(data) {
    var params = {"id" : data.message.id};
    var radius = Math.ceil(data.message.radius);

    eb_client.event_get(params, function(err, data) {
      if (!data) {
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
      
      var params = {"longitude": lng,
      "latitude" : lat, 
      "within_unit" : "K", 
      "max" : READ_SIZE, 
      "page" : 1, 
      "sort_by" : "id", 
      "date" : util.getEventbriteDateFormat(startDate) + " " + util.getEventbriteDateFormat(endDate), 
      "within" : radius};

      eb_client.event_search(params, function(err, data) {
        socket.emit("getEventsResult", {message: data, center:{lat: lat, lng: lng}, date:{startDate : startDate, endDate : endDate}});
      });
    });
  });
});

console.log("## Serenedi started ##");
