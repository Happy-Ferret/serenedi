var util = require('../../../shared/Util.js');
var urlArgs = require('./UrlArgs.js');
var statusVM = require('./StatusViewModel.js').getStatusViewModel();
var mapControlObject = require('./MapControl.js');

var today = new Date();
var weekAfter = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
var MAP_BOX = 'mapBox';
var INFO_TEMPLATE = 'infoPopUpTemplate';
var mapViewModel;

var MapViewModel = function() {
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
  this.eventToOpenID = parseInt(urlArgs.id, 10);
  this.dragging = false;
  this.waitedSinceLastChange = undefined;
  this.distCheckPass = true;

  var self = this;

  this.prop.bind('change', function(event, attr, how, newVal, oldVal) {
    if (self.prop.ready) {
      clearTimeout(self.waitedSinceLastChange);
      self.waitedSinceLastChange = setTimeout(function() {
        self.updateMap();
      }, 1400);
    }
  });

  this.prop.bind('lat', function(event, newVal, oldVal) {
    self.distCheckPass = false;
  });

  this.prop.bind('lng', function(event, newVal, oldVal) {
    self.distCheckPass = false;
  });

  this.prop.bind('radius', function(event, newVal, oldVal) {
    self.distCheckPass = true;
  });

  this.prop.bind('types', function(event, newVal, oldVal) {
    self.clearMap();
    self.distCheckPass = true;
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

  this.map = new google.maps.Map(document.getElementById(MAP_BOX), {
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
    self.distCheckPass = false;
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
module.exports.getMapViewModel = function() {
  if (!mapViewModel) {
    mapViewModel = new MapViewModel();
  }
  return mapViewModel;
};

MapViewModel.prototype.centerToLatLng = function() {
  this.map.setCenter(new google.maps.LatLng(this.prop.lat, this.prop.lng));
};

MapViewModel.prototype.clearMap = function () {
  this.closeLastOpen();

  for (var n = 0; n < this.markers.length; n++) {
    this.markers[n].setMap(null);
  }

  this.markers = [];
  this.ids = [];
};

MapViewModel.prototype.getScreenTravelDistance = function() {
  return util.getDistanceFromLatLng(this.prop.lat, this.prop.lng, this.latestLoc.lat, this.latestLoc.lng);
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

MapViewModel.prototype.validateLatLng = function() {
  return util.isNumber(this.prop.lat) && util.isNumber(this.prop.lng);
};

MapViewModel.prototype.isNeedUpdate = function() {
  if (this.dragging) {
    return false;
  }
  // Is it current working?
  if (statusVM.getStatus() === 1) {
    return false;
  }
  if (this.prop.radius > 19) {
    statusVM.setStatus(statusVM.CONST.ZOOM_ERROR);
    return false;
  }
  if (!this.validateLatLng()) {
    return false;
  }

  return this.distCheckPass || Math.abs(this.getScreenTravelDistance()) > this.prop.radius / 1.5;
};

MapViewModel.prototype.updateMap = function() {
  if (this.isNeedUpdate()) {
    statusVM.setStatus(statusVM.CONST.WORKING);
    this.latestLoc.lat = this.prop.lat;
    this.latestLoc.lng = this.prop.lng;

    var mapControl = mapControlObject.getMapControl();

    if (this.eventToOpenID) {
      mapControl.getEventsByIDCall({
        id : this.eventToOpenID,
        radius : this.prop.radius
      });
    } else {
      mapControl.getEventsCall({
        lat : this.prop.lat,
        lng : this.prop.lng,
        dateFrom : this.prop.dateFrom,
        dateTo : this.prop.dateTo,
        type : this.prop.types,
        radius : this.prop.radius
      });
    }
  }
};

MapViewModel.prototype.addEventMarker = function (event) {
  var point = new google.maps.LatLng(event.venue.latitude, event.venue.longitude);

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
          url: {eventbrite: event.url, serenedi: SERENEDI_URL + '/?id=' + event.id},
          start: event.start_date.split(' ')[0],
          end: event.end_date.split(' ')[0],
          showAddr: event.venue.address !== null || event.venue.address !== '',
          addr: event.venue.address + ' ' + event.venue.address_2,
          city: event.venue.city,
          region: event.venue.region,
          zip: event.venue.postalcode,
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

  if (event.id === self.eventToOpenID) {
    google.maps.event.trigger(marker, 'click');
    self.eventToOpenID = null;
    var center = self.map.getCenter();
    self.prop.attr('lat', util.roundNumber(center.lat()));
    self.prop.attr('lng', util.roundNumber(center.lng()));
  }
};
