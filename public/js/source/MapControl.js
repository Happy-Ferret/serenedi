var $ = require('../../../bower_components/jquery/jquery.min.js');
var util = require('./Util.js');
var mapModel = new (require('./MapModel.js')).MapModel(updateMap);
var socketModel = new (require('./SocketModel.js')).SocketModel(getEventCallback);
var statusObservable;
var dateFromDom;
var dateToDom;

var MapControl = can.Control({
  init: function(element, statusObservableOption) {
    initializeMainElements(this.element);
    mapModel.initializeMap();
    statusObservable = statusObservableOption;

    if (mapModel.eventToOpenID) {
      mapModel.prop.attr('ready', true);
      can.trigger(mapModel.prop, 'change');
    } else {
      loadMyLocation();
    }
  },
  '.datePicker change': function(el, ev) {
    mapModel.clearMap();
    can.trigger(mapModel.prop, 'change');
  },
  '#loadMyLocation click': function(el, ev) {
    loadMyLocation();
  }
});
exports.MapControl = MapControl;

var loadMyLocation = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      mapModel.prop.attr('lat', util.roundNumber(position.coords.latitude));
      mapModel.prop.attr('lng', util.roundNumber(position.coords.longitude));
      mapModel.prop.attr('ready', true);

      mapModel.centerToLatLng();
    }, function(error) {
      mapModel.prop.attr('ready', true);
    });
  } else {
    statusObservable.status.attr('value', 4);
  }
};

var initializeMainElements = function(element) {
  element.html(can.view('mapTemplate', mapModel));
  mapModel.eventToOpenID = parseInt(util.getURLArgument.id, 10);

  dateFromDom = $('#dateFrom');
  dateToDom = $('#dateTo');

  dateFromDom.datepicker({
    defaultDate : mapModel.prop.dateFrom,
    changeMonth : true,
    changeYear : true,
    numberOfMonths : 1,
    onSelect : function(selectedDate) {
      dateToDom.datepicker('option', 'minDate', selectedDate);
      $(this).trigger('change');
    },
    maxDate: mapModel.prop.dateTo
  });
  dateToDom.datepicker({
    defaultDate : mapModel.prop.dateFrom,
    changeMonth : true,
    changeYear : true,
    numberOfMonths : 1,
    onSelect : function(selectedDate) {
      dateFromDom.datepicker('option', 'maxDate', selectedDate);
      $(this).trigger('change');
    },
    minDate: mapModel.prop.dateFrom
  });

  $('#loadMyLocation').popover();
  $('#sideMenu').mCustomScrollbar();
};

function getEventCallback(data) {
  if (data.message !== null) {
    if (data.center) {
      mapModel.map.setCenter(new google.maps.LatLng(data.center.lat, data.center.lng));
    }

    if (data.date) {
      mapModel.prop.attr('dateFrom', data.date.startDate);
      mapModel.prop.attr('dateTo', data.date.endDate);
      dateFromDom.datepicker('option', 'maxDate', data.date.endDate);
      dateToDom.datepicker('option', 'minDate', data.date.startDate);
    }

    for (var n = 1; n < data.message.events.length; n++) {
      var currentEvent = data.message.events[n].event;

      if (mapModel.ids[currentEvent.id] !== 1) {
        mapModel.ids[currentEvent.id] = 1;
        addMarkers(currentEvent);
      }
    }

    statusObservable.status.attr('value', 0);
  } else {
    statusObservable.status.attr('value', 2);
  }
}

var isNeedUpdate = function() {
  if (mapModel.dragging) {
    return false;
  }
  // Is it current working?
  if (statusObservable.status.attr('value') === 1) {
    return false;
  }
  if (mapModel.prop.radius > 19) {
    statusObservable.status.attr('value', 3);
    return false;
  } 
  if (!mapModel.validateLatLng()) {
    return false;
  }

  return mapModel.distCheckPass || Math.abs(mapModel.getScreenTravelDistance()) > mapModel.prop.radius / 1.5;
};

function updateMap() {
  if (isNeedUpdate()) {
    statusObservable.status.attr('value', 1);
    mapModel.latestLoc.lat = mapModel.prop.lat;
    mapModel.latestLoc.lng = mapModel.prop.lng;

    if (mapModel.eventToOpenID) {
      socketModel.socket.emit('getEventsByIDCall', {
        message: { id : mapModel.eventToOpenID,
          radius : mapModel.prop.radius
        }
      });
    } else {
        console.log(mapModel);
      socketModel.socket.emit('getEventsCall', {
        message: { 
          lat : mapModel.prop.lat,
          lng : mapModel.prop.lng,
          dateFrom : mapModel.prop.dateFrom,
          dateTo : mapModel.prop.dateTo,
          type : mapModel.prop.types,
          radius : mapModel.prop.radius
        }
      });
    }
  }
}

var addMarkers = function (event) {
  var point = new google.maps.LatLng(event.venue.latitude, event.venue.longitude);

  var marker = new google.maps.Marker({
    position: point,
    map : mapModel.map,
    title : event.title,
    animation : google.maps.Animation.DROP,
    clickable : true
  });

  mapModel.markers.push(marker);

  google.maps.event.addListener(
    marker,
    'click',
    function() {
      mapModel.closeLastOpen();

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

      info.open(mapModel.map, marker);

      marker.setAnimation(google.maps.Animation.BOUNCE);

      mapModel.lastClick.marker = marker;
      mapModel.lastClick.info = info;

      FB.XFBML.parse();
    });

  if (event.id === mapModel.eventToOpenID) {
    google.maps.event.trigger(marker, 'click');
    mapModel.eventToOpenID = null;
    var center = mapModel.map.getCenter();
    mapModel.prop.attr('lat', util.roundNumber(center.lat()));
    mapModel.prop.attr('lng', util.roundNumber(center.lng()));
  }
};