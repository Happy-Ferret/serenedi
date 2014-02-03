var $ = require("../../../bower_components/jquery/jquery.min.js");
var util = require("./Util.js");
var statusObservable = require("./StatusObservable.js");
var mapModel = require("./MapModel.js").mapModel;

var MapControl = can.Control({
  init: function(element, options) {
    setupSocket();
    initializeMainElements(this.element);
    initializeMap();

    if (!mapModel.eventToOpenID) {
      loadMyLocation();
    } else {
      callUpdateMap();
    }
  },
  ".type change": function(el, ev) {
    typeChanged();
    mapModel.clearMap();
    callUpdateMap();
  },
  ".datePicker change": function(el, ev) {
    mapModel.clearMap();
    callUpdateMap();
  },
  ".location change": function(el, ev) {
    var elementId = el.attr('id');

    if (elementId === 'lat') {
      mapModel.prop.attr('lat', el.val());
    } else if (elementId === 'lng') {
      mapModel.prop.attr('lng', el.val());
    } 

    mapModel.centerToLatLng();
    callUpdateMap();
  },
  "#loadMyLocation click": function(el, ev) {
    loadMyLocation();
  }
});
exports.MapControl = MapControl;

var loadMyLocation = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      mapModel.prop.attr('lat', util.roundNumber(position.coords.latitude));
      mapModel.prop.attr('lng', util.roundNumber(position.coords.longitude));

      mapModel.centerToLatLng();
      callUpdateMap();
    });
  } else {
    mapModel.centerToLatLng();
    callUpdateMap();
  }
};

var initializeMainElements = function(element) {
  element.html(can.view("mapTemplate", {}));
  mapModel.eventToOpenID = parseInt(util.getURLArgument.id, 10);

  $("#dateFrom").datepicker({
    defaultDate : "",
    changeMonth : true,
    changeYear : true,
    numberOfMonths : 1,
    onSelect : function(selectedDate) {
      $("#dateTo").datepicker("option", "minDate", selectedDate);
      $(this).trigger("change");
    }
  });
  $("#dateTo").datepicker({
    defaultDate : "+1w",
    changeMonth : true,
    changeYear : true,
    numberOfMonths : 1,
    onSelect : function(selectedDate) {
      $("#dateFrom").datepicker("option", "maxDate", selectedDate);
      $(this).trigger("change");
    }
  });

  var today = new Date();
  $("#dateFrom").val(util.getPrettyDate(today));
  $("#dateTo").datepicker("option", "minDate", today);

  var todayPlusOne = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
  $("#dateTo").val(util.getPrettyDate(todayPlusOne));
  $("#dateFrom").datepicker("option", "maxDate", todayPlusOne);
  $("#sideMenu").mCustomScrollbar();

  $("#loadMyLocation").popover();
};

var initializeMap = function () {
  mapModel.map = new google.maps.Map(document.getElementById("mapBox"), {
    zoom : 15,
    center : new google.maps.LatLng(mapModel.prop.lat, mapModel.prop.lng),
    mapTypeId : google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    mapTypeControl: true
  });

  google.maps.event.addListenerOnce(mapModel.map, "idle", function() {
    var ne = mapModel.map.getBounds().getNorthEast();
    var sw = mapModel.map.getBounds().getSouthWest();

    $("#radius").val(util.getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()) / 3);

    mapModel.prop.attr('lat', util.roundNumber(mapModel.map.getCenter().lat()));
    mapModel.prop.attr('lng', util.roundNumber(mapModel.map.getCenter().lng()));
  });

  google.maps.event.addListener(mapModel.map, "dragstart", function() {
    mapModel.dragging = true;
  });

  google.maps.event.addListener(mapModel.map, "dragend", function() {
    mapModel.prop.attr('lat', util.roundNumber(mapModel.map.getCenter().lat()));
    mapModel.prop.attr('lng', util.roundNumber(mapModel.map.getCenter().lng()));
    mapModel.dragging = false;
    callUpdateMap();
  });

  google.maps.event.addListener(mapModel.map, "zoom_changed", function() {
    var ne = mapModel.map.getBounds().getNorthEast();
    var sw = mapModel.map.getBounds().getSouthWest();

    $("#radius").val(util.getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()));

    callUpdateMap();
  });
};

var setupSocket = function() {
  var socketOptions = {
    "transports" : [ "jsonp-polling" ],
    "try multiple transports" : false,
    "reconnect" : true,
    "connect timeout" : 5000,
    "reconnection limit attempts": 15
  };

  mapModel.socket = io.connect(URL, socketOptions);

  mapModel.socket.on("getEventsResult", function(data) {

    if (data.message !== null) {
      if (data.center) {
        mapModel.map.setCenter(new google.maps.LatLng(data.center.lat, data.center.lng));
      }

      if (data.date) {
        $("#dateFrom").datepicker("option", "maxDate", data.date.endDate);
        $("#dateFrom").val(data.date.startDate);
        $("#dateTo").datepicker("option", "minDate", data.date.startDate);
        $("#dateTo").val(data.date.endDate);
      }

      for (var n = 1; n < data.message.events.length; n++) {
        var currentEvent = data.message.events[n].event;

        if (mapModel.ids[currentEvent.id] !== 1) {
          mapModel.ids[currentEvent.id] = 1;
          addMarkers(currentEvent);
        }
      }

      statusObservable.status.attr("value", 0);
    } else {
      statusObservable.status.attr("value", 2);
    }
  });
};

var isNeedUpdate = function() {
  if (mapModel.dragging) {
    return false;
  }
  // Is it current working?
  if (statusObservable.status.attr("value") === 1) {
    return false;
  }
  if ($("#radius").val() > 19) {
    statusObservable.status.attr("value", 3);
    return false;
  } 
  if (!mapModel.validateLatLng()) {
    return false;
  }

  return mapModel.distCheckPass || Math.abs(mapModel.getScreenTravelDistance()) > $("#radius").val() / 1.5;
};

var callUpdateMap = function () {
  clearTimeout(mapModel.waitedSinceLastChange);
  mapModel.waitedSinceLastChange = setTimeout(updateMap(), 500);
};

var updateMap = function() {
  if (isNeedUpdate()) {
    statusObservable.status.attr("value", 1);
    mapModel.latestLoc.lat = mapModel.prop.lat;
    mapModel.latestLoc.lng = mapModel.prop.lng;

    if (mapModel.eventToOpenID) {
      mapModel.socket.emit("getEventsByIDCall", {
        message: { id : mapModel.eventToOpenID,
          radius : $("#radius").val()}
        });
    } else {
      mapModel.socket.emit("getEventsCall", {
        message: { 
          lat : mapModel.prop.lat,
          lng : mapModel.prop.lng,
          dateFrom : $("#dateFrom").val(),
          dateTo : $("#dateTo").val(),
          type : $("#categories").val(),
          radius : $("#radius").val() 
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
    "click",
    function() {
      mapModel.closeLastOpen();

      var info = new google.maps.InfoWindow({
        content: can.view.render("infoPopUpTemplate",
        {   
          title: marker.getTitle(), 
          url: {eventbrite: event.url, serenedi: URL + "/?id=" + event.id},
          start: event.start_date.split(" ")[0],
          end: event.end_date.split(" ")[0],
          showAddr: event.venue.address !== null || event.venue.address !== "",
          addr: event.venue.address + " " + event.venue.address_2,
          city: event.venue.city,
          region: event.venue.region,
          zip: event.venue.postalcode,
          category: event.category
        })
      });

      google.maps.event.addListenerOnce(info, "closeclick", function() {
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
    google.maps.event.trigger(marker, "click");
    mapModel.eventToOpenID = null;
    var center = mapModel.map.getCenter();
    mapModel.prop.attr('lat', util.roundNumber(center.lat()));
    mapModel.prop.attr('lng', util.roundNumber(center.lng()));
  }
};

var flagCheck = function(element) {
  if ($(element).prop("checked")) {
    return "1";
  } else {
    return "0";
  }
};

var typeChanged = function() {
  var result = flagCheck("#typeConfFlag");

  result += flagCheck("#typeConvFlag");
  result += flagCheck("#typeEntFlag");
  result += flagCheck("#typeFairFlag");
  result += flagCheck("#typeFoodFlag");
  result += flagCheck("#typeFundFlag");
  result += flagCheck("#typeMeetFlag");
  result += flagCheck("#typeMusicFlag");
  result += flagCheck("#typePerfFlag");
  result += flagCheck("#typeRecFlag");
  result += flagCheck("#typeReligFlag");
  result += flagCheck("#typeReunFlag");
  result += flagCheck("#typeSalesFlag");
  result += flagCheck("#typeSemiFlag");
  result += flagCheck("#typeSociFlag");
  result += flagCheck("#typeSportsFlag");
  result += flagCheck("#typeTradeFlag");
  result += flagCheck("#typeTravelFlag");
  result += flagCheck("#typeOtherFlag");

  $("#categories").val(result);
};
