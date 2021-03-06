var util = require('../../../shared/Util.js');
var statusVM = require('./StatusViewModel.js');
var mapVM = require('./MapViewModel.js');
var sideMenuVM = require('./SideMenuViewModel.js');
var urlArgs = require('./UrlArgs.js');
var eventToOpenID = urlArgs.id;
var eventToOpenType = urlArgs.type;
var programEvents = require('./ProgramEvents.js');

var waitedSinceLastChange;
var emptyReturnedEventsCallCount;

programEvents.add(function(event) {
  if (event.event === 'updateMap') {
    clearTimeout(waitedSinceLastChange);
    waitedSinceLastChange = setTimeout(function() {
      mapControl.updateMap();
    }, 1400);
  }
});

var MapControl = can.Control({
  init: function() {
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
  console.log('loadmyloc');
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

    if (!mapVM.ids[identifier]) {
      mapVM.ids[identifier] = true;
      mapVM.addEventMarker(currentEvent);
    }
  }
};

MapControl.prototype.getEventsByIdCall = function(param) {
  var self = this;
  eventToOpenID = null;
  getEventsAjaxDeferred('getEventsById', param).done(function(data) {
    if (data.center) {
      mapVM.setLatLng(data.center.lat, data.center.lng);
      self.centerToLatLng();
    }

    if (data.date) {
      sideMenuVM.setDateToSelectedEvent(data.date.startDate, data.date.endDate);
    }
    self.processEventData(data);
    self.getEvents();
  }).fail(function(error) {
    console.log('ERROR: getEventsByID call failed.', error);
  });
};

MapControl.prototype.getEventsCall = function(param) {
  var self = this;
  emptyReturnedEventsCallCount = 0;
  getEventsAjaxDeferred('eb/getEvents', param).done(function(data) {
    self.processEventData(data);
  }).fail(function(error) {
    console.log('ERROR: eventBrite getEvents call failed.', error);
  });

  getEventsAjaxDeferred('mu/getEvents', param).done(function(data) {
    self.processEventData(data);
  }).fail(function(error) {
    console.log('ERROR: meetUp getEvents call failed.', error);
  });
};

MapControl.prototype.processEventData = function(data) {
  if (data.searchResult && data.searchResult.length > 0) {
    this.addEventMarkers(data.searchResult);
    statusVM.setStatus(statusVM.CONST.NORMAL);
  } else {
    emptyReturnedEventsCallCount++;
    if (emptyReturnedEventsCallCount === 2) {
      statusVM.setStatus(statusVM.CONST.NO_EVENTS);
    }
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

var mapControl = new MapControl();
module.exports.getMapControl = mapControl;
