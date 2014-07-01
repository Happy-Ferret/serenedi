var util = require('../../../shared/Util.js');
var statusVM = require('./StatusViewModel.js').getStatusViewModel();
var mapVM = require('./MapViewModel.js').getMapViewModel();
var sideMenuVM = require('./SideMenuViewModel.js').getSideMenuViewModel();
var urlArgs = require('./UrlArgs.js');
var eventToOpenID = urlArgs.id;
var eventToOpenType = urlArgs.type;
var programEvents = require('./ProgramEvents.js');

var mapControl;
var waitedSinceLastChange;

module.exports.getMapControl = function() {
  if (!mapControl) {
    programEvents.add(function(event) {
      if (event.event === 'updateMap') {
        clearTimeout(waitedSinceLastChange);
        waitedSinceLastChange = setTimeout(function() {
          mapControl.updateMap();
        }, 1400);
      }
    });

    mapControl = new MapControl();
  }
  return mapControl;
};

var MapControl = can.Control({
  init: function() {
    this.sideMenu = sideMenuVM;

    if (eventToOpenID && eventToOpenType) {
      programEvents.dispatch({ event: 'updateMap' });
    } else {
      this.loadMyLocation();
    }
  },
  '#loadMyLocation click': function(el, ev) {
    this.loadMyLocation();
    programEvents.dispatch({ event: 'updateMap' });
  }
});

MapControl.prototype.getEvents = function() {
  this.getEventsCall({
    lat : mapVM.mapProp.lat,
    lng : mapVM.mapProp.lng,
    dateFrom : sideMenuVM.sideMenuProp.dateFrom,
    dateTo : sideMenuVM.sideMenuProp.dateTo,
    type : sideMenuVM.sideMenuProp.types,
    radius : mapVM.mapProp.radius
  });
};

MapControl.prototype.getEventsById = function() {
  this.getEventsByIdCall({
    id : eventToOpenID,
    sourceType : eventToOpenType
  });
};

MapControl.prototype.loadMyLocation = function() {
  if (navigator.geolocation) {
    var self = this;
    navigator.geolocation.getCurrentPosition(function (position) {
      mapVM.mapProp.attr('lat', util.roundNumber(position.coords.latitude));
      mapVM.mapProp.attr('lng', util.roundNumber(position.coords.longitude));

      self.centerToLatLng();
      programEvents.dispatch({ event: 'updateMap' });
    }, function(error) {
      console.log(error);
      programEvents.dispatch({ event: 'updateMap' });
    });
  } else {
    statusVM.setStatus(statusVM.CONST.GEO_ERROR);
  }
};

MapControl.prototype.addEventMarkers = function(events) {
  if (!events) {
    return;
  }
  for (var n = 0; n < events.length; n++) {
    var currentEvent = events[n];
    var identifier = currentEvent.type + currentEvent.id;

    if (mapVM.ids[identifier] !== 1) {
      mapVM.ids[identifier] = 1;
      mapVM.addEventMarker(currentEvent);
    }
  }
};

MapControl.prototype.getEventsByIdCall = function(param) {
  var self = this;
  getEventsAjaxDeferred('getEventsById', param).done(function(data) {
    self.processEventData(data);
    self.getEvents();
  }).fail(function() {
    console.log('ERROR: getEventsByID call failed.');
  });
};

MapControl.prototype.getEventsCall = function(param) {
  var self = this;
  getEventsAjaxDeferred('eb/getEvents', param).done(function(data) {
    self.processEventData(data);
  }).fail(function() {
    console.log('ERROR: eventBrite getEvents call failed.');
  });

  getEventsAjaxDeferred('mu/getEvents', param).done(function(data) {
    self.processEventData(data);
  }).fail(function() {
    console.log('ERROR: meetUp getEvents call failed.');
  });
};

MapControl.prototype.processEventData = function(data) {
  if (data.searchResult) {
    if (data.center) {
      var center = new google.maps.LatLng(data.center.lat, data.center.lng);
      mapVM.map.setCenter(center);
    }

    if (data.date) {
      sideMenuVM.setDateToSelectedEvent(data.date.startDate, data.date.endDate);
    }

    this.addEventMarkers(data.searchResult);
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

    if (eventToOpenID && eventToOpenType) {
      this.getEventsById();
    } else {
      this.getEvents();
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
