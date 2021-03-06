var util = require('../../../shared/Util.js');
var programEvents = require('./ProgramEvents.js');

var MAP_BOX = 'mapBox';
var INFO_TEMPLATE = 'infoPopUpTemplate';
var eventToOpenID = require('./UrlArgs.js').id;

var MapViewModel = function() {
  this.mapProp = new can.Observe({lat: 40.72616,
                                  lng: -73.99973,
                                  radius: undefined});

  this.map = null;
  this.ids = [];
  this.markers = [];
  this.lastClick = {marker: null, info: null};
  this.latestLoc = {lat: null, lng: null};
  this.dragging = false;
  this.distCheckPass = true;

  var self = this;

  this.mapProp.bind('lat', function(event, newVal, oldVal) {
    self.distCheckPass = false;
  });

  this.mapProp.bind('lng', function(event, newVal, oldVal) {
    self.distCheckPass = false;
  });

  this.mapProp.bind('radius', function(event, newVal, oldVal) {
    self.distCheckPass = true;
  });

  this.map = new google.maps.Map(document.getElementById(MAP_BOX), {
    zoom : 15,
    center : new google.maps.LatLng(self.mapProp.lat, self.mapProp.lng),
    mapTypeId : google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    mapTypeControl: true
  });

  google.maps.event.addListenerOnce(this.map, 'idle', function() {
    var ne = self.map.getBounds().getNorthEast();
    var sw = self.map.getBounds().getSouthWest();

    self.mapProp.attr('radius', Math.ceil(util.getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()) / 3));
    self.mapProp.attr('lat', util.roundNumber(self.map.getCenter().lat()));
    self.mapProp.attr('lng', util.roundNumber(self.map.getCenter().lng()));

    self.mapProp.bind('change', function(event, attr, how, newVal, oldVal) {
      programEvents.dispatch({ event: 'updateMap' });
    });
  });

  google.maps.event.addListener(this.map, 'dragstart', function() {
    self.dragging = true;
    self.distCheckPass = false;
  });

  google.maps.event.addListener(this.map, 'dragend', function() {
    self.dragging = false;
    self.mapProp.attr('lat', util.roundNumber(self.map.getCenter().lat()));
    self.mapProp.attr('lng', util.roundNumber(self.map.getCenter().lng()));
  });

  google.maps.event.addListener(this.map, 'zoom_changed', function() {
    var ne = self.map.getBounds().getNorthEast();
    var sw = self.map.getBounds().getSouthWest();

    self.mapProp.attr('radius', util.getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()) / 3);
  });
};

MapViewModel.prototype.clearMap = function () {
  this.closeLastOpen();

  for (var n = 0; n < this.markers.length; n++) {
    this.markers[n].setMap(null);
  }

  this.markers = [];
  this.ids = [];
};

MapViewModel.prototype.closeLastOpen = function () {
  if (this.lastClick.info) {
    this.lastClick.info.close();
    this.lastClick.info = null;
  }
  if (this.lastClick.marker) {
    this.lastClick.marker.setAnimation(null);
    this.lastClick.marker = null;
  }
};

MapViewModel.prototype.addEventMarker = function (event) {
  var point = new google.maps.LatLng(event.lat, event.lng);

  var marker = new google.maps.Marker({
    position: point,
    map : this.map,
    title : event.title,
    animation : google.maps.Animation.DROP,
    clickable : true
  });

  this.markers.push(marker);
  var self = this;

  google.maps.event.addListener(
    marker,
    'click',
    function() {
      self.closeLastOpen();

      var info = new google.maps.InfoWindow({
        content: can.view.render(INFO_TEMPLATE, {
          title: marker.getTitle(),
          url: {host: event.url, serenedi: (SERENEDI_URL.substring(0,7) === 'http://' ? '' : 'http://') + SERENEDI_URL + '/?id=' + event.id + '&type=' + event.type},
          start: event.startDate,
          end: event.endDate,
          showAddr: event.addr ? true : false,
          addr: event.addr,
          city: event.city,
          region: event.region,
          zip: event.postalcode,
          category: event.category
        })
      });

      google.maps.event.addListenerOnce(info, 'closeclick', function() {
        marker.setAnimation(null);
      });

      google.maps.event.addListenerOnce(info, 'domready', function() {
        FB.XFBML.parse();
      });

      info.open(self.map, marker);

      marker.setAnimation(google.maps.Animation.BOUNCE);

      self.lastClick.marker = marker;
      self.lastClick.info = info;

      FB.XFBML.parse();
    });

  if (event.id === eventToOpenID) {
    google.maps.event.trigger(marker, 'click');
    self.eventToOpenID = null;
    var center = self.map.getCenter();
    self.mapProp.attr('lat', util.roundNumber(center.lat()));
    self.mapProp.attr('lng', util.roundNumber(center.lng()));
  }
};

MapViewModel.prototype.setLatLng = function(lat, lng) {
  this.mapProp.attr('lat', lat);
  this.mapProp.attr('lng', lng);
};


var mapViewModel = new MapViewModel();
module.exports = mapViewModel;
