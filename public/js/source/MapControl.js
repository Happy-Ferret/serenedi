require('../../../bower_components/canjs/can.jquery.js');
require('../../../bower_components/canjs/can.control.plugin.js');
var urlArgs = require('./UrlArgs.js').urlArgs;
var util = require('../../../shared/Util.js');
var statusVM = require('./StatusViewModel.js').getStatusViewModel();

module.exports.InitMapControl = function(element, sideMenuTemplate, mapBoxId, infoPopUpTemplate) {
  return new MapControl(element, {
    'sideMenuTemplate': sideMenuTemplate,
    'mapBoxId': mapBoxId,
    'infoPopUpTemplate': infoPopUpTemplate
  });
};

var MapControl = can.Control({
  init: function(element, options) {
    this.mapModel = new (require('./MapViewModel.js')).MapViewModel(this, options.mapBoxId, options.infoPopUpTemplate);
    this.initializeMainElements(options.sideMenuTemplate);
    this.mapModel.initializeMap();

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

MapControl.prototype.initializeMainElements = function(sideMenuTemplate) {
  $('#sideMenu').html(can.view(sideMenuTemplate, this.mapModel));
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
  $('#sideMenu').mCustomScrollbar({
    advanced:{
        autoScrollOnFocus: false
    }
  });
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

MapControl.prototype.getEventsByIDCall = function(data) {
  var self = this;
  getGetEventsAjaxDeferred('getEventsById', data).done(function(data) {
    self.getEventCallback(data);
  }).fail(function() {
    console.log('ERROR: getEvents call failed.');
  });
};

MapControl.prototype.getEventsCall = function(data) {
  var self = this;
  getGetEventsAjaxDeferred('getEvents', data).done(function(data) {
    self.getEventCallback(data);
  }).fail(function() {
    console.log('ERROR: getEvents call failed.');
  });
};

MapControl.prototype.getEventCallback = function(data) {
  if (data.message !== null) {
    if (data.center) {
      this.setMapCenter(new google.maps.LatLng(data.center.lat, data.center.lng));
    }

    if (data.date) {
      this.setDateToSelectedEvent(data.date.startDate, data.date.endDate);
    }

    this.addEventMarkers(data.events);
    statusVM.setStatus(statusVM.CONST.NORMAL);
  } else {
    statusVM.setStatus(statusVM.CONST.NO_EVENTS);
  }
};

var getGetEventsAjaxDeferred = function(url, data) {
  return $.ajax({
    type: 'GET',
    url: '/api/' + url,
    data: data,
    cache: false
  });
};