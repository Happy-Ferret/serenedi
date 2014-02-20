var util = require("./Util.js");
var today = new Date();
var weekAfter = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);

var MapModel = function(updateMap) {
  this.prop = new can.Observe({lat: 40.72616, 
                                                lng: -73.99973, 
                                                radius: undefined, 
                                                types: '1111111111111111111',
                                                ready: false,
                                                dateFrom: util.getPrettyDate(today),
                                                dateTo: util.getPrettyDate(weekAfter)});

  this.types = new can.Observe({conf: true,
                                                conv: true,
                                                ent: true,
                                                fair: true,
                                                food: true,
                                                fund: true,
                                                meet: true,
                                                music: true,
                                                perf: true,
                                                rec: true,
                                                relig: true,
                                                reun: true,
                                                sales: true,
                                                semi: true,
                                                soci: true,
                                                sports: true,
                                                trade: true,
                                                travel: true,
                                                other: true});

  this.map = null;
  this.ids = [];
  this.markers = [];
  this.lastClick = {marker: null, info: null};
  this.latestLoc = {lat: null, lng: null};
  this.eventToOpenID = null;
  this.dragging = false;
  this.waitedSinceLastChange = undefined;
  this.distCheckPass = true;

  this.prop.bind('change', function(event, attr, how, newVal, oldVal) {
    if (this.ready) {
      clearTimeout(this.waitedSinceLastChange);
      this.waitedSinceLastChange = setTimeout(updateMap, 1400);
    }
  });

  this.prop.bind('lat', function(event, newVal, oldVal) {
    this.distCheckPass = false;
  });

  this.prop.bind('lng', function(event, newVal, oldVal) {
    this.distCheckPass = false;
  });

  this.prop.bind('radius', function(event, newVal, oldVal) {
    this.distCheckPass = true;
  });

  var self = this;

  this.prop.bind('types', function(event, newVal, oldVal) {
    self.clearMap();
    this.distCheckPass = true;
  });

  this.types.bind('change', function(event, attr, how, newVal, oldVal) {
    self.prop.attr('types', (this.conf ? '1' : '0') + 
                                      (this.conv ? '1' : '0') +
                                      (this.ent ? '1' : '0') + 
                                      (this.fair ? '1' : '0') + 
                                      (this.food ? '1' : '0') + 
                                      (this.fund ? '1' : '0') + 
                                      (this.meet ? '1' : '0') + 
                                      (this.music? '1' : '0') + 
                                      (this.perf ? '1' : '0') + 
                                      (this.rec ? '1' : '0') + 
                                      (this.relig ? '1' : '0') + 
                                      (this.reun ? '1' : '0') + 
                                      (this.sales ? '1' : '0') + 
                                      (this.semi ? '1' : '0') + 
                                      (this.soci ? '1' : '0') + 
                                      (this.sports ? '1' : '0') + 
                                      (this.trade ? '1' : '0') + 
                                      (this.travel ? '1' : '0') + 
                                      (this.other ? '1' : '0'));
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

MapModel.prototype.initializeMap = function () {
  var self = this;

  this.map = new google.maps.Map(document.getElementById('mapBox'), {
    zoom : 15,
    center : new google.maps.LatLng(self.prop.lat, self.prop.lng),
    mapTypeId : google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    mapTypeControl: true
  });

  google.maps.event.addListenerOnce(this.map, 'idle', function() {
    var ne = self.map.getBounds().getNorthEast();
    var sw = self.map.getBounds().getSouthWest();

    self.prop.attr('radius', util.getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()) / 3);
    self.prop.attr('lat', util.roundNumber(self.map.getCenter().lat()));
    self.prop.attr('lng', util.roundNumber(self.map.getCenter().lng()));
  });

  google.maps.event.addListener(this.map, 'dragstart', function() {
    self.dragging = true;
  });

  google.maps.event.addListener(this.map, 'dragend', function() {
    self.dragging = false;
    self.prop.attr('lat', util.roundNumber(self.map.getCenter().lat()));
    self.prop.attr('lng', util.roundNumber(self.map.getCenter().lng()));
  });

  google.maps.event.addListener(this.map, 'zoom_changed', function() {
    var ne = self.map.getBounds().getNorthEast();
    var sw = self.map.getBounds().getSouthWest();

    self.prop.attr('radius', util.getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()) / 3);
  });
};