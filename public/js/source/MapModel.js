var $ = require("../../../bower_components/jquery/jquery.min.js");
var util = require("./Util.js");

var MapModel = function() {
  this.location = new can.Observe({lat: 40.72616, lng: -73.99973});

  this.map = null;
  this.ids = [];
  this.markers = [];
  this.lastClick = {marker: null, info: null};
  this.latestLoc = {lat: null, lng: null};
  this.eventToOpenID = null;
  this.dragging = false;
  this.socket = null;
  this.waitedSinceLastChange = undefined;

  this.location.bind('lat', function(event, newVal, oldVal) {
    $('#lat').val(newVal);
  });

  this.location.bind('lng', function(event, newVal, oldVal) {
    $('#lng').val(newVal);
  });
};
exports.mapModel = new MapModel();

MapModel.prototype.centerToLatLng = function() {
  this.map.setCenter(new google.maps.LatLng(this.location.lat, this.location.lng));
};

MapModel.prototype.clearMap = function () {
  this.closeLastOpen();

  for (var n = 0; n < this.markers.length; n++) {
    this.markers[n].setMap(null);
  }

  this.markers = [];
  this.ids = [];
};

MapModel.prototype.getScreenTravelDistance = function() {
  return util.getDistanceFromLatLng(this.location.lat, this.location.lng, this.latestLoc.lat, this.latestLoc.lng);
};

MapModel.prototype.closeLastOpen = function () {
  if (this.lastClick.info) {
    this.lastClick.info.close();
  }
  if (this.lastClick.marker) {
    this.lastClick.marker.setAnimation(null);
  }
  this.lastClick.info = null;
  this.lastClick.marker = null;
};

MapModel.prototype.validateLatLng = function() {
  return util.isNumber(this.location.lat) && util.isNumber(this.location.lng);
};