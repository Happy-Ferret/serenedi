var $ = require('../../../bower_components/jquery/jquery.min.js');
var util = require('./Util.js');
var statusObservable;
var dateFromDom;
var dateToDom;

var MapControl = can.Control({
  init: function(element, statusObservableOption) {
    this.mapModel = new (require('./MapModel.js')).MapModel(this);
    this.socketModel = new (require('./SocketModel.js')).SocketModel(this);
    this.initializeMainElements();
    this.mapModel.initializeMap();
    statusObservable = statusObservableOption;

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
    navigator.geolocation.getCurrentPosition(function (position) {
      this.mapModel.prop.attr('lat', util.roundNumber(position.coords.latitude));
      this.mapModel.prop.attr('lng', util.roundNumber(position.coords.longitude));
      this.mapModel.prop.attr('ready', true);

      this.mapModel.centerToLatLng();
    }, function(error) {
      this.mapModel.prop.attr('ready', true);
    });
  } else {
    statusObservable.status.attr('value', 4);
  }
};

MapControl.prototype.initializeMainElements = function() {
  this.element.html(can.view('mapTemplate', this.mapModel));
  this.mapModel.eventToOpenID = parseInt(util.getURLArgument.id, 10);

  dateFromDom = $('#dateFrom');
  dateToDom = $('#dateTo');

  dateFromDom.datepicker({
    defaultDate : this.mapModel.prop.dateFrom,
    changeMonth : true,
    changeYear : true,
    numberOfMonths : 1,
    onSelect : function(selectedDate) {
      dateToDom.datepicker('option', 'minDate', selectedDate);
      $(this).trigger('change');
    },
    maxDate: this.mapModel.prop.dateTo
  });
  dateToDom.datepicker({
    defaultDate : this.mapModel.prop.dateFrom,
    changeMonth : true,
    changeYear : true,
    numberOfMonths : 1,
    onSelect : function(selectedDate) {
      dateFromDom.datepicker('option', 'maxDate', selectedDate);
      $(this).trigger('change');
    },
    minDate: this.mapModel.prop.dateFrom
  });

  $('#loadMyLocation').popover();
  $('#sideMenu').mCustomScrollbar();
};

MapControl.prototype.getEventCallback = function(data) {
  if (data.message !== null) {
    if (data.center) {
      this.mapModel.map.setCenter(new google.maps.LatLng(data.center.lat, data.center.lng));
    }

    if (data.date) {
      this.mapModel.prop.attr('dateFrom', data.date.startDate);
      this.mapModel.prop.attr('dateTo', data.date.endDate);
      dateFromDom.datepicker('option', 'maxDate', data.date.endDate);
      dateToDom.datepicker('option', 'minDate', data.date.startDate);
    }

    for (var n = 1; n < data.message.events.length; n++) {
      var currentEvent = data.message.events[n].event;

      if (this.mapModel.ids[currentEvent.id] !== 1) {
        this.mapModel.ids[currentEvent.id] = 1;
        this.addMarkers(currentEvent);
      }
    }

    statusObservable.status.attr('value', 0);
  } else {
    statusObservable.status.attr('value', 2);
  }
};

MapControl.prototype.isNeedUpdate = function() {
  if (this.mapModel.dragging) {
    return false;
  }
  // Is it current working?
  if (statusObservable.status.attr('value') === 1) {
    return false;
  }
  if (this.mapModel.prop.radius > 19) {
    statusObservable.status.attr('value', 3);
    return false;
  } 
  if (!this.mapModel.validateLatLng()) {
    return false;
  }

  return this.mapModel.distCheckPass || Math.abs(this.mapModel.getScreenTravelDistance()) > this.mapModel.prop.radius / 1.5;
};

MapControl.prototype.updateMap = function() {
  if (this.isNeedUpdate()) {
    statusObservable.status.attr('value', 1);
    this.mapModel.latestLoc.lat = this.mapModel.prop.lat;
    this.mapModel.latestLoc.lng = this.mapModel.prop.lng;

    if (this.mapModel.eventToOpenID) {
      this.socketModel.socket.emit('getEventsByIDCall', {
        message: { id : this.mapModel.eventToOpenID,
          radius : this.mapModel.prop.radius
        }
      });
    } else {
        console.log(this.mapModel);
      this.socketModel.socket.emit('getEventsCall', {
        message: { 
          lat : this.mapModel.prop.lat,
          lng : this.mapModel.prop.lng,
          dateFrom : this.mapModel.prop.dateFrom,
          dateTo : this.mapModel.prop.dateTo,
          type : this.mapModel.prop.types,
          radius : this.mapModel.prop.radius
        }
      });
    }
  }
};

MapControl.prototype.addMarkers = function (event) {
  var point = new google.maps.LatLng(event.venue.latitude, event.venue.longitude);

  var marker = new google.maps.Marker({
    position: point,
    map : this.mapModel.map,
    title : event.title,
    animation : google.maps.Animation.DROP,
    clickable : true
  });

  this.mapModel.markers.push(marker);

  google.maps.event.addListener(
    marker,
    'click',
    function() {
      this.mapModel.closeLastOpen();

      var info = new google.maps.InfoWindow({
        content: can.view.render('infoPopUpTemplate',
        {   
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

      info.open(this.mapModel.map, marker);

      marker.setAnimation(google.maps.Animation.BOUNCE);

      this.mapModel.lastClick.marker = marker;
      this.mapModel.lastClick.info = info;

      FB.XFBML.parse();
    });

  if (event.id === this.mapModel.eventToOpenID) {
    google.maps.event.trigger(marker, 'click');
    this.mapModel.eventToOpenID = null;
    var center = this.mapModel.map.getCenter();
    this.mapModel.prop.attr('lat', util.roundNumber(center.lat()));
    this.mapModel.prop.attr('lng', util.roundNumber(center.lng()));
  }
};