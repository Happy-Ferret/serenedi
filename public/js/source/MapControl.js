var util = require('../../../shared/Util.js');
var statusVM = require('./StatusViewModel.js').getStatusViewModel();
var mapVM = require('./MapViewModel.js').getMapViewModel();
var sideMenuVM = require('./SideMenuViewModel.js').getSideMenuViewModel();
var eventToOpenID = parseInt(require('./UrlArgs.js').id, 10);
var mapUpdateTrigger = require('./MapUpdateTrigger.js');

var mapControl;

module.exports.getMapControl = function() {
  if (!mapControl) {
    mapControl = new MapControl();
  }
  return mapControl;
};

var MapControl = can.Control({
  init: function() {
    this.sideMenu = sideMenuVM;

    if (eventToOpenID) {
      mapUpdateTrigger();
    } else {
      this.loadMyLocation();
    }
  },
  '.datePicker change': function(el, ev) {
    if (el.prop('id') === 'dateFrom') {
      sideMenuVM.sideMenuProp.attr('dateFrom', el.val());
    } else if (el.prop('id') === 'dateTo') {
      sideMenuVM.sideMenuProp.attr('dateTo', el.val());
    }

    can.trigger(sideMenuVM.sideMenuProp, 'change');
    mapVM.clearMap();
  },
  '#loadMyLocation click': function(el, ev) {
    this.loadMyLocation();
  }
});

MapControl.prototype.loadMyLocation = function() {
  if (navigator.geolocation) {
    var self = this;
    navigator.geolocation.getCurrentPosition(function (position) {
      mapVM.mapProp.attr('lat', util.roundNumber(position.coords.latitude));
      mapVM.mapProp.attr('lng', util.roundNumber(position.coords.longitude));

      self.centerToLatLng();
      mapUpdateTrigger();
    }, function(error) {
      console.log(error);
      mapUpdateTrigger();
    });
  } else {
    statusVM.setStatus(statusVM.CONST.GEO_ERROR);
  }
};

MapControl.prototype.addEventMarkers = function(events) {
  for (var n = 1; n < events.length; n++) {
    var currentEvent = events[n].event;

    if (mapVM.ids[currentEvent.id] !== 1) {
      mapVM.ids[currentEvent.id] = 1;
      mapVM.addEventMarker(currentEvent);
    }
  }
};

MapControl.prototype.getEventsByIDCall = function(data) {
  var self = this;
  getEventsAjaxDeferred('getEventsById', data).done(function(data) {
    self.getEventCallback(data);
  }).fail(function() {
    console.log('ERROR: getEventsByID call failed.');
  });
};

MapControl.prototype.getEventsCall = function(data) {
  var self = this;
  getEventsAjaxDeferred('getEvents', data).done(function(data) {
    self.getEventCallback(data);
  }).fail(function() {
    console.log('ERROR: getEvents call failed.');
  });
};

MapControl.prototype.getEventCallback = function(data) {
  if (data.message !== null) {
    if (data.center) {
      var center = new google.maps.LatLng(data.center.lat, data.center.lng);
      mapVM.map.setCenter(center);
    }

    if (data.date) {
      this.sideMenu.setDateToSelectedEvent(data.date.startDate, data.date.endDate);
    }

    this.addEventMarkers(data.events);
    statusVM.setStatus(statusVM.CONST.NORMAL);
  } else {
    statusVM.setStatus(statusVM.CONST.NO_EVENTS);
  }
};

MapControl.prototype.updateMap = function() {
  if (this.isNeedUpdate()) {
    statusVM.setStatus(statusVM.CONST.WORKING);
    mapVM.latestLoc.lat = mapVM.mapProp.lat;
    mapVM.latestLoc.lng = mapVM.mapProp.lng;

    if (eventToOpenID) {
      this.getEventsByIDCall({
        id : eventToOpenID,
        radius : mapVM.mapProp.radius
      });
    } else {
      this.getEventsCall({
        lat : mapVM.mapProp.lat,
        lng : mapVM.mapProp.lng,
        dateFrom : sideMenuVM.sideMenuProp.dateFrom,
        dateTo : sideMenuVM.sideMenuProp.dateTo,
        type : sideMenuVM.sideMenuProp.types,
        radius : mapVM.mapProp.radius
      });
    }
  }
};

MapControl.prototype.isNeedUpdate = function() {
  if (mapVM.dragging) {
    return false;
  }
  // Is it current working?
  if (statusVM.getStatus() === 1) {
    return false;
  }
  if (mapVM.mapProp.radius > 19) {
    statusVM.setStatus(statusVM.CONST.ZOOM_ERROR);
    return false;
  }
  if (!this.validateLatLng()) {
    return false;
  }

  return mapVM.distCheckPass || Math.abs(this.getScreenTravelDistance()) > mapVM.mapProp.radius / 1.5;
};

MapControl.prototype.getScreenTravelDistance = function() {
  return util.getDistanceFromLatLng(mapVM.mapProp.lat, mapVM.mapProp.lng, mapVM.latestLoc.lat, mapVM.latestLoc.lng);
};

MapControl.prototype.validateLatLng = function() {
  return util.isNumber(mapVM.mapProp.lat) && util.isNumber(mapVM.mapProp.lng);
};

MapControl.prototype.centerToLatLng = function() {
  mapVM.map.setCenter(new google.maps.LatLng(mapVM.mapProp.lat, mapVM.mapProp.lng));
};

var getEventsAjaxDeferred = function(url, data) {
  return $.ajax({
    type: 'GET',
    url: '/api/' + url,
    data: data,
    cache: false
  });
};
