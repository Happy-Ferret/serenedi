var $ = require("../../../bower_components/jquery/jquery.min.js");
var util = require("./Util.js");
var statusObservable = require("./StatusObservable.js");

var mapModel = {
  map: null,
  ids: [],
  markers: [],
  lastClickMarker: null,
  lastOpen: null,
  latestLoc: {lat: null, lng: null},
  distCheckPass: null,
  eventToOpenID: null,
  dragging: false,
  MAX_NUMBER: 9007199254740992,
  socket: null,
  defaultLoc: {lat: 40.72616, lng: -73.99973},
  waitedSinceLastChange: undefined
};


var MapControl = can.Control({
  init: function(element, options) {
    setupSocket();
    initializeMainElements(this.element);

    initializeMap();

    if (!mapModel.eventToOpenID) {
      loadMyLocation();
    } else {
      callUpdateMap(true);
    }

    updateMap();
  },
  ".type change": function(el, ev) {
    typeChanged();
    clearMap();
    callUpdateMap(true);
  },
  ".datePicker change": function(el, ev) {
    clearMap();
    callUpdateMap(true);
  },
  ".location change": function(el, ev) {
    if (validateLatLng()) {
      callUpdateMap(true);
      reCenter();
    }
  },
  "#loadMyLocation click": function(el, ev) {
    loadMyLocation();
  }
});
exports.MapControl = MapControl;

var loadMyLocation = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      var lat = util.roundNumber(position.coords.latitude);
      var lng = util.roundNumber(position.coords.longitude);

      $("#lat").val(lat);
      $("#lng").val(lng);

      reCenter();
      callUpdateMap(true);
    });
  } else {
    $("#lat").val(mapModel.defaultLoc.lat);
    $("#lng").val(mapModel.defaultLoc.lng);

    reCenter();
    callUpdateMap(true);
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
    center : new google.maps.LatLng(mapModel.defaultLoc.lat, mapModel.defaultLoc.lng),
    mapTypeId : google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true,
    mapTypeControl: true
  });

  google.maps.event.addListenerOnce(mapModel.map, "idle", function() {
    var ne = mapModel.map.getBounds().getNorthEast();
    var sw = mapModel.map.getBounds().getSouthWest();

    $("#radius").val(util.getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()) / 3);
    $("#lat").val(util.roundNumber(mapModel.map.getCenter().lat()));
    $("#lng").val(util.roundNumber(mapModel.map.getCenter().lng()));
  });

  google.maps.event.addListener(mapModel.map, "dragstart", function() {
    mapModel.dragging = true;
  });

  google.maps.event.addListener(mapModel.map, "dragend", function() {
    $("#lat").val(util.roundNumber(mapModel.map.getCenter().lat()));
    $("#lng").val(util.roundNumber(mapModel.map.getCenter().lng()));
    mapModel.dragging = false;
    callUpdateMap(false);
  });

  google.maps.event.addListener(mapModel.map, "zoom_changed", function() {
    var ne = mapModel.map.getBounds().getNorthEast();
    var sw = mapModel.map.getBounds().getSouthWest();

    $("#radius").val(util.getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()));

    callUpdateMap(true);
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
    var m = 1;  
    var n = 0;

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

      while (m < data.message.events.length) {

        if (n >= mapModel.ids.length) {
          mapModel.ids[n] = mapModel.MAX_NUMBER;
        }

        if (data.message.events[m].event.id < mapModel.ids[n]) {
          if (mapModel.ids[n] === mapModel.MAX_NUMBER) {
            mapModel.ids.pop();
          }

          mapModel.ids.push(data.message.events[m].event.id);
          addMarkers(data.message.events[m].event);

          m++;
        } else if (data.message.events[m].event.id > mapModel.ids[n]) { 
          n++;
        } else {
          n++;
          m++;
        }
      }

      mapModel.ids.sort();
      statusObservable.status.attr("value", 0);
    } else {
      statusObservable.status.attr("value", 2);
    }
  });
};

var getDistanceFromLastLoc = function() {
  return util.getDistanceFromLatLng($("#lat").val(), $("#lng").val(), mapModel.latestLoc.lat, mapModel.latestLoc.lng);
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
  if (!validateLatLng()) {
    return false;
  }

  return mapModel.distCheckPass || Math.abs(getDistanceFromLastLoc()) > $("#radius").val() / 1.5;
};

var callUpdateMap = function (flag) {
  mapModel.distCheckPass = flag;

  clearTimeout(mapModel.waitedSinceLastChange);
  mapModel.waitedSinceLastChange = setTimeout(updateMap, 500);
};

var updateMap = function() {
  if (isNeedUpdate()) {
    statusObservable.status.attr("value", 1);
    mapModel.latestLoc.lat = $("#lat").val();
    mapModel.latestLoc.lng = $("#lng").val();

    if (mapModel.eventToOpenID) {
      mapModel.socket.emit("getEventsByIDCall", {
        message: { id : mapModel.eventToOpenID,
          radius : $("#radius").val()}
        });
    } else {
      mapModel.socket.emit("getEventsCall", {
        message: { lat : $("#lat").val(),
        lng : $("#lng").val(),
        dateFrom : $("#dateFrom").val(),
        dateTo : $("#dateTo").val(),
        type : $("#categories").val(),
        radius : $("#radius").val() }
      });
    }
  }
};

var clearMap = function () {
  closeLastOpen();

  for (var n = 0; n < mapModel.markers.length; n++) {
    mapModel.markers[n].setMap(null);
  }

  mapModel.markers = [];
  mapModel.ids = [];
};

var closeLastOpen = function () {
  if (mapModel.lastOpen) {
    mapModel.lastOpen.close();
  }
  if (mapModel.lastClickMarker) {
    mapModel.lastClickMarker.setAnimation(null);
  }
  mapModel.lastOpen = null;
  mapModel.lastClickMarker = null;
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

  marker.info = new google.maps.InfoWindow({content: "<strong>" + event.title + "</strong><br />"});
  mapModel.markers.push(marker);

  google.maps.event.addListener(
    marker,
    "click",
    function() {
      closeLastOpen();

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

      info.open(mapModel.map, marker);

      marker.setAnimation(google.maps.Animation.BOUNCE);

      mapModel.lastClickMarker = marker;
      mapModel.lastOpen = info;

      setTimeout(function() {
        try {
          FB.XFBML.parse();
        } catch (ex) {
        }
      } , 100);
    }
  );

  if (event.id === mapModel.eventToOpenID) {
    google.maps.event.trigger(marker, "click");
    mapModel.eventToOpenID = null;
    var center = mapModel.map.getCenter();
    $("#lat").val(center.lat());
    $("#lng").val(center.lng());
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

var validateLatLng = function() {
  return util.isNumber($("#lat").val()) && util.isNumber($("#lng").val());
};

var reCenter = function() {
  mapModel.map.setCenter(new google.maps.LatLng($("#lat").val(), $("#lng").val()));
};