var $ = require("../../../bower_components/jquery/jquery.min.js");
var util = require("./Util.js");

var MapModel = function(callUpdateMap) {
  this.prop = new can.Observe({lat: 40.72616, lng: -73.99973, radius: undefined, types: '1111111111111111111', ready: false});

  this.map = null;
  this.ids = [];
  this.markers = [];
  this.lastClick = {marker: null, info: null};
  this.latestLoc = {lat: null, lng: null};
  this.eventToOpenID = null;
  this.dragging = false;
  this.socket = null;
  this.waitedSinceLastChange = undefined;
  this.distCheckPass = true;

  this.prop.bind('change', function(event, attr, how, newVal, oldVal) {
    if (this.ready) {
      callUpdateMap();
    }
  });

  this.prop.bind('lat', function(event, newVal, oldVal) {
    $('#lat').val(newVal);
    this.distCheckPass = false;
  });

  this.prop.bind('lng', function(event, newVal, oldVal) {
    $('#lng').val(newVal);
    this.distCheckPass = false;
  });

  this.prop.bind('radius', function(event, newVal, oldVal) {
    this.distCheckPass = true;
  });

  this.prop.bind('types', function(event, newVal, oldVal) {
    this.distCheckPass = true;
  });
};
exports.MapModel = MapModel;

MapModel.prototype.centerToLatLng = function() {
  this.map.setCenter(new google.maps.LatLng(this.prop.lat, this.prop.lng));
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
  return util.getDistanceFromLatLng(this.prop.lat, this.prop.lng, this.latestLoc.lat, this.latestLoc.lng);
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
  return util.isNumber(this.prop.lat) && util.isNumber(this.prop.lng);
};

MapModel.prototype.flagCheck = function(element) {
  if ($(element).prop('checked')) {
    return '1';
  } else {
    return '0';
  }
};

MapModel.prototype.typeChanged = function() {
  var result = this.flagCheck('#typeConfFlag');
  result += this.flagCheck('#typeConvFlag');
  result += this.flagCheck('#typeEntFlag');
  result += this.flagCheck('#typeFairFlag');
  result += this.flagCheck('#typeFoodFlag');
  result += this.flagCheck('#typeFundFlag');
  result += this.flagCheck('#typeMeetFlag');
  result += this.flagCheck('#typeMusicFlag');
  result += this.flagCheck('#typePerfFlag');
  result += this.flagCheck('#typeRecFlag');
  result += this.flagCheck('#typeReligFlag');
  result += this.flagCheck('#typeReunFlag');
  result += this.flagCheck('#typeSalesFlag');
  result += this.flagCheck('#typeSemiFlag');
  result += this.flagCheck('#typeSociFlag');
  result += this.flagCheck('#typeSportsFlag');
  result += this.flagCheck('#typeTradeFlag');
  result += this.flagCheck('#typeTravelFlag');
  result += this.flagCheck('#typeOtherFlag');

  this.prop.attr('types', result);
};
