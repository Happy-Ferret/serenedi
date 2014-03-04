var $ = require('../../../bower_components/jquery/jquery.min.js');
var urlArgs = require('./UrlArgs.js').urlArgs;
var util = require('./Util.js');

var MapControl = can.Control({
  init: function(element, status) {
    this.mapModel = new (require('./MapViewModel.js')).MapViewModel(this);
    this.socketModel = new (require('./SocketViewModel.js')).SocketViewModel(this);
    this.initializeMainElements();
    this.mapModel.initializeMap();
    this.status = status;

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
    } else {
      this.mapModel.prop.attr('dateTo', el.val());
    }
    can.trigger(this.mapModel.prop, 'change');
    this.mapModel.clearMap();
  },
  '#loadMyLocation click': function(el, ev) {
    this.loadMyLocation();
  }
});
exports.MapControl = MapControl;

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
    this.status.attr('value', 4);
  }
};

MapControl.prototype.initializeMainElements = function() {
  this.element.html(can.view('mapTemplate', this.mapModel));
  this.mapModel.eventToOpenID = parseInt(urlArgs.id, 10);

  this.dateFromDom = $('#dateFrom');
  this.dateToDom = $('#dateTo');

  this.dateFromDom.datepicker({
    defaultDate : this.mapModel.prop.dateFrom,
    changeMonth : true,
    changeYear : true,
    numberOfMonths : 1,
    onSelect : function(selectedDate) {
      this.dateToDom.datepicker('option', 'minDate', selectedDate);
      $(this).trigger('change');
    },
    maxDate: this.mapModel.prop.dateTo
  });
  this.dateToDom.datepicker({
    defaultDate : this.mapModel.prop.dateFrom,
    changeMonth : true,
    changeYear : true,
    numberOfMonths : 1,
    onSelect : function(selectedDate) {
      this.dateFromDom.datepicker('option', 'maxDate', selectedDate);
      $(this).trigger('change');
    },
    minDate: this.mapModel.prop.dateFrom
  });

  $('#loadMyLocation').popover();
  $('#sideMenu').mCustomScrollbar();
};

MapControl.prototype.setStatus = function(value) {
  this.status.attr('value', value);
};

MapControl.prototype.getStatus = function(value) {
  this.status.attr('value');
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

MapControl.prototype.setDateToSelectedEvent = function(startDate, endDate) {
  this.mapModel.prop.attr('dateFrom', startDate);
  this.mapModel.prop.attr('dateTo', endDate);
  this.dateFromDom.datepicker('option', 'maxDate', endDate);
  this.dateToDom.datepicker('option', 'minDate', startDate);
};

MapControl.prototype.setMapCenter = function(center) {
  this.mapModel.map.setCenter(center);
};


MapControl.prototype.getEventsByIDCall = function(message) {
  this.socketModel.socket.emit('getEventsByIDCall', message);
};


MapControl.prototype.getEventsCall = function(message) {
  this.socketModel.socket.emit('getEventsCall', message);
};