var $ = require('../../../bower_components/jquery/jquery.min.js');
var util = require('./Util.js');
var statusObservable = require('./StatusObservable.js');
var MapModel = require('./MapModel.js').MapModel;
var mapModel = new MapModel(callUpdateMap);

var MapControl = can.Control({
  init: function(element, options) {
    setupSocket();
    initializeMainElements(this.element);
    initializeMap();

    if (mapModel.eventToOpenID) {
      mapModel.prop.attr('ready', true);
      callUpdateMap();
    } else {
      loadMyLocation();
    }
  },
  '.type change': function(el, ev) {
    mapModel.typeChanged();
    mapModel.clearMap();
  },
  '.datePicker change': function(el, ev) {
    mapModel.clearMap();
    callUpdateMap();
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
  element.html(can.view('mapTemplate', {mapModel: mapModel}));
  mapModel.eventToOpenID = parseInt(util.getURLArgument.id, 10);

  $('#dateFrom').datepicker({
    defaultDate : '',
    changeMonth : true,
    changeYear : true,
    numberOfMonths : 1,
    onSelect : function(selectedDate) {
      $('#dateTo').datepicker('option', 'minDate', selectedDate);
      $(this).trigger('change');
    }
  });
  $('#dateTo').datepicker({
    defaultDate : '+1w',
    changeMonth : true,
    changeYear : true,
    numberOfMonths : 1,
    onSelect : function(selectedDate) {
      $('#dateFrom').datepicker('option', 'maxDate', selectedDate);
      $(this).trigger('change');
    }
  });

  var today = new Date();
  $('#dateFrom').val(util.getPrettyDate(today));
  $('#dateTo').datepicker('option', 'minDate', today);

  var todayPlusOne = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  $('#dateTo').val(util.getPrettyDate(todayPlusOne));
  $('#dateFrom').datepicker('option', 'maxDate', todayPlusOne);
  $('#sideMenu').mCustomScrollbar();

  $('#loadMyLocation').popover();
  $('#lat').val(mapModel.prop.lat);
  $('#lng').val(mapModel.prop.lng);
};

var initializeMap = function () {
  mapModel.map = new google.maps.Map(document.getElementById('mapBox'), {
    zoom : 15,
    center : new google.maps.LatLng(mapModel.prop.lat, mapModel.prop.lng),
    mapTypeId : google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    mapTypeControl: true
  });

  google.maps.event.addListenerOnce(mapModel.map, 'idle', function() {
    var ne = mapModel.map.getBounds().getNorthEast();
    var sw = mapModel.map.getBounds().getSouthWest();

    mapModel.prop.attr('radius', util.getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()) / 3);
    mapModel.prop.attr('lat', util.roundNumber(mapModel.map.getCenter().lat()));
    mapModel.prop.attr('lng', util.roundNumber(mapModel.map.getCenter().lng()));
  });

  google.maps.event.addListener(mapModel.map, 'dragstart', function() {
    mapModel.dragging = true;
  });

  google.maps.event.addListener(mapModel.map, 'dragend', function() {
    mapModel.dragging = false;
    mapModel.prop.attr('lat', util.roundNumber(mapModel.map.getCenter().lat()));
    mapModel.prop.attr('lng', util.roundNumber(mapModel.map.getCenter().lng()));
  });

  google.maps.event.addListener(mapModel.map, 'zoom_changed', function() {
    var ne = mapModel.map.getBounds().getNorthEast();
    var sw = mapModel.map.getBounds().getSouthWest();

    mapModel.prop.attr('radius', util.getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()) / 3);
  });
};

var setupSocket = function() {
  var socketOptions = {
    'transports' : [ 'jsonp-polling' ],
    'try multiple transports' : false,
    'reconnect' : true,
    'connect timeout' : 5000,
    'reconnection limit attempts': 15
  };

  mapModel.socket = io.connect(URL, socketOptions);

  mapModel.socket.on('getEventsResult', function(data) {

    if (data.message !== null) {
      if (data.center) {
        mapModel.map.setCenter(new google.maps.LatLng(data.center.lat, data.center.lng));
      }

      if (data.date) {
        $('#dateFrom').datepicker('option', 'maxDate', data.date.endDate);
        $('#dateFrom').val(data.date.startDate);
        $('#dateTo').datepicker('option', 'minDate', data.date.startDate);
        $('#dateTo').val(data.date.endDate);
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
  });
};

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

function callUpdateMap() {
  clearTimeout(mapModel.waitedSinceLastChange);
  mapModel.waitedSinceLastChange = setTimeout(updateMap, 800);
}

var updateMap = function() {
  if (isNeedUpdate()) {
    statusObservable.status.attr('value', 1);
    mapModel.latestLoc.lat = mapModel.prop.lat;
    mapModel.latestLoc.lng = mapModel.prop.lng;

    if (mapModel.eventToOpenID) {
      mapModel.socket.emit('getEventsByIDCall', {
        message: { id : mapModel.eventToOpenID,
          radius : mapModel.prop.radius
        }
      });
    } else {
      mapModel.socket.emit('getEventsCall', {
        message: { 
          lat : mapModel.prop.lat,
          lng : mapModel.prop.lng,
          dateFrom : $('#dateFrom').val(),
          dateTo : $('#dateTo').val(),
          type : mapModel.prop.types,
          radius : mapModel.prop.radius
        }
      });
    }
  }
};

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
          url: {eventbrite: event.url, serenedi: URL + '/?id=' + event.id},
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