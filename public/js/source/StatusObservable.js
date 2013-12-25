var $ = require("../../../bower_components/jquery/jquery.min.js");

var status = new can.Observe({value: 0});
exports.status = status;

// 0 idle
// 1 working
// 2 no events
// 3 radius check fail
status.bind("change", function(event, attr, how, newVal, oldVal) {
  switch (newVal) {
    case 0: 
      showNormal();
      break;
    case 1:
      showWorking();
      break;
    case 2:
      showNoEvents();
      break;
    case 3:
      showZoomCheckFail();
      break;
  }
});

var showWorking = function () {
  $("#statusImg").attr({"data-content": "Working...", src: "/images/ajax-loader.gif"});
};

var showZoomCheckFail = function () {
  $("#statusImg").attr({"data-content": "Zoom level is too high. Please zoom in to load events.", src: "/images/warning.png"});
};

var showNoEvents = function () {
  $("#statusImg").attr({"data-content": "There are no events with given criterias.", src: "/images/warning.png"});
};

var showNormal = function () {
  $("#statusImg").attr({"data-content": "Welcome to Serenedi!", src: "/images/serenedi3.ico"});
};
