var $ = require("../../../bower_components/jquery/jquery.min.js");
var util = require("./Util.js");

var mapModel = {
  map: null,
  ids: [],
  markers: [],
  lastClick: {marker: null, info: null},
  latestLoc: {lat: null, lng: null},
  eventToOpenID: null,
  dragging: false,
  socket: null,
  defaultLoc: {lat: 40.72616, lng: -73.99973},
  waitedSinceLastChange: undefined
};
exports.mapModel = mapModel;

mapModel.centerToLatLng = function() {
  this.map.setCenter(new google.maps.LatLng($("#lat").val(), $("#lng").val()));
};

mapModel.clearMap = function () {
  this.closeLastOpen();

  for (var n = 0; n < this.markers.length; n++) {
    this.markers[n].setMap(null);
  }

  this.markers = [];
  this.ids = [];
};

mapModel.getScreenTravelDistance = function() {
  return util.getDistanceFromLatLng($("#lat").val(), $("#lng").val(), this.latestLoc.lat, this.latestLoc.lng);
};

mapModel.closeLastOpen = function () {
  if (this.lastClick.info) {
    this.lastClick.info.close();
  }
  if (this.lastClick.marker) {
    this.lastClick.marker.setAnimation(null);
  }
  this.lastClick.info = null;
  this.lastClick.marker = null;
};

mapModel.validateLatLng = function() {
  return util.isNumber($("#lat").val()) && util.isNumber($("#lng").val());
};