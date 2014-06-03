var MapViewModel = require('./MapViewModel.js');
var util = require('../../../shared/Util.js');
var statusVM = require('./StatusViewModel.js').getStatusViewModel();
var SideMenuViewModel = require('./SideMenuViewModel.js');

var mapControl;

module.exports.getMapControl = function() {
  if (!mapControl) {
    mapControl = new MapControl();
  }
  return mapControl;
};

var MapControl = can.Control({
  init: function() {
    this.mapModel = new MapViewModel(this);
    this.sideMenu = new SideMenuViewModel(this.mapModel);

    if (this.mapModel.eventToOpenID) {
      this.mapModel.prop.attr('ready', true);
      can.trigger(this.mapModel.prop, 'change');
    } else {
      this.loadMyLocation();
    }
  },
  '.datePicker change': function(el, ev) {
    if (el.prop('id') === 'dateFrom') {
      this.mapModel.prop.attr('dateFrom', el.val());
    } else if (el.prop('id') === 'dateTo') {
      this.mapModel.prop.attr('dateTo', el.val());
    }

    can.trigger(this.mapModel.prop, 'change');
    this.mapModel.clearMap();
  },
  '#loadMyLocation click': function(el, ev) {
    this.loadMyLocation();
  }
});

MapControl.prototype.loadMyLocation = function() {
  if (navigator.geolocation) {
    var self = this;
    navigator.geolocation.getCurrentPosition(function (position) {
      self.mapModel.prop.attr('lat', util.roundNumber(position.coords.latitude));
      self.mapModel.prop.attr('lng', util.roundNumber(position.coords.longitude));
      self.mapModel.prop.attr('ready', true);

      self.mapModel.centerToLatLng();
    }, function(error) {
      self.mapModel.prop.attr('ready', true);
    });
  } else {
    statusVM.setStatus(statusVM.CONST.GEO_ERROR);
  }
};

MapControl.prototype.addEventMarkers = function(events) {
  for (var n = 1; n < events.length; n++) {
    var currentEvent = events[n].event;

    if (this.mapModel.ids[currentEvent.id] !== 1) {
      this.mapModel.ids[currentEvent.id] = 1;
      this.mapModel.addEventMarker(currentEvent);
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
      this.mapModel.map.setCenter(center);
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