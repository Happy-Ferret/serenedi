var READ_SIZE = 100;

var config;
var fs = require("fs");
var path = require("path");
var express = require("express");
var app = express();
var eventbrite = require("eventbrite");

var configFile = fs.readFileSync(path.join(process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE, ".serenedirc"), "utf-8");
if (!configFile) {
  throw new Error("Missing .serenedirc");
}
else {
  config = JSON.parse(configFile);
}


var io = require("socket.io").listen(app.listen(config.port));
var eb_client = eventbrite({"app_key" : config.eventbriteAPIkey});


app.use(express.static(__dirname + "/public"));
app.get("/", function (req, res) { res.redirect("/index.html"); });

io.sockets.on("connection", function(socket) {
  socket.on("getEventsCall", function(data) {
    var params = {"longitude": data.message.lng,
      "latitude" : data.message.lat,
      "within_unit" : "K",
      "max" : READ_SIZE,
      "page" : 1,
      "within" : Math.ceil(data.message.radius),
      "date" : getEventbriteDateRange(data.message.dateFrom, data.message.dateTo),
      "category" : getTypeString(data.message.type),
      "sort_by" : "id"};

    eb_client.event_search(params, function(err, data) {
      socket.emit("getEventsResult", {message : data});
    });
  });

  socket.on("getEventsByIDCall", function(data) {
    var params = {"id" : data.message.id};
    var radius = Math.ceil(data.message.radius);

    eb_client.event_get(params, function(err, data) {
      if (data === null || data === "") {
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
      "date" : "", 
      "max" : READ_SIZE, 
      "page" : 1, 
      "sort_by" : "id", 
      "data" : getEventbriteDateRange(startDate, endDate), 
      "within" : radius};

      eb_client.event_search(params, function(err, data) {

        socket.emit("getEventsResult", {message: data, center:{lat: lat, lng: lng}, date:{startDate : startDate, endDate : endDate}});
      });
    });
  });
});

function getPrettyDate(date) {
  var month = date.getMonth() + 1;
  var day = date.getDate();

  if (month < 10) {
    month = month + "0";
  } 
  if (day < 10) {
    day = day + "0";
  } 

  return month + "/" + day + "/" + date.getFullYear();
}



function getEventbriteDateRange(from, to) {
  var fromArray = from.split("/");
  var toArray = to.split("/");

  return fromArray[2] + "-" + fromArray[0] + "-" + fromArray[1] + " " + toArray[2] + "-" + toArray[0] + "-" + toArray[1];
}

//TODO There is a better way of handling this...  
function getTypeString(type) {
  var typeStr = "";

  if (type.charAt(0) == "1") {
    typeStr += "conference, ";
  }

  if (type.charAt(1) == "1") {
    typeStr += "conventions, ";
  }

  if (type.charAt(2) == "1") {
    typeStr += "entertainment, ";
  }

  if (type.charAt(3) == "1") {
    typeStr += "fairs, ";
  }

  if (type.charAt(4) == "1") {
    typeStr += "food, ";
  }

  if (type.charAt(5) == "1") {
    typeStr += "fundraisers, ";
  }

  if (type.charAt(6) == "1") {
    typeStr += "meetings, ";
  }

  if (type.charAt(7) == "1") {
    typeStr += "music, ";
  }

  if (type.charAt(8) == "1") {
    typeStr += "performances, ";
  }

  if (type.charAt(9) == "1") {
    typeStr += "recreation, ";
  }

  if (type.charAt(10) == "1") {
    typeStr += "religion, ";
  }

  if (type.charAt(11) == "1") {
    typeStr += "reunions, ";
  }

  if (type.charAt(12) == "1") {
    typeStr += "sales, ";
  }

  if (type.charAt(13) == "1") {
    typeStr += "social, ";
  }

  if (type.charAt(14) == "1") {
    typeStr += "sports, ";
  }

  if (type.charAt(15) == "1") {
    typeStr += "tradeshows, ";
  }

  if (type.charAt(16) == "1") {
    typeStr += "travel, ";
  }

  if (type.charAt(17) == "1") {
    typeStr += "other";
  }

  return typeStr;
}

