var util = require('../../../shared/Util.js');
var statusVM = require('./StatusViewModel.js').getStatusViewModel();
var mapVM = require('./MapViewModel.js').getMapViewModel();
var sideMenuVM = require('./SideMenuViewModel.js').getSideMenuViewModel();

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

    if (mapVM.eventToOpenID) {
      mapVM.prop.attr('ready', true);
      can.trigger(mapVM.prop, 'change');
    } else {
      this.loadMyLocation();
    }
  },
  '.datePicker change': function(el, ev) {
    if (el.prop('id') === 'dateFrom') {
      mapVM.prop.attr('dateFrom', el.val());
    } else if (el.prop('id') === 'dateTo') {
      mapVM.prop.attr('dateTo', el.val());
    }

    can.trigger(mapVM.prop, 'change');
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
      mapVM.prop.attr('lat', util.roundNumber(position.coords.latitude));
      mapVM.prop.attr('lng', util.roundNumber(position.coords.longitude));
      mapVM.prop.attr('ready', true);

      mapVM.centerToLatLng();
    }, function(error) {
      mapVM.prop.attr('ready', true);
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
    console.log('ERROR: getEvents call failed.');
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

var getEventsAjaxDeferred = function(url, data) {
  return $.ajax({
    type: 'GET',
    url: '/api/' + url,
    data: data,
    cache: false
  });
};
