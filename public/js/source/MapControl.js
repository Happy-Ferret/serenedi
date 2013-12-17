var $ = require('../../../bower_components/jquery/jquery.min.js');
var util = require('./Util.js');
var statusObservable = require('./StatusObservable.js');

var map;
var ids = [];
var markers = [];
var lastClickMarker = null;
var lastOpen;
var latestLoc = {lat: null, lng: null};
var distCheckPass = null;
var eventToOpenID = null;
var dragging = false;
var needUpdate = true;
var MAX_NUMBER = 9007199254740992;
var socket = null;
var defaultLoc = {lat: 40.72616, lng: -73.99973};


var MapControl = can.Control({
    init: function(element, options) {
        setupSocket();
        initializeMainElements(this.element);

        initializeMap();

        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var lat = util.roundNumber(position.coords.latitude);
                var lng = util.roundNumber(position.coords.longitude);

                $('#lat').val(lat);
                $('#lng').val(lng);

                map.setCenter(new google.maps.LatLng(lat, lng));
            });
        }
        callUpdateMap(true);
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
    }
});
exports.MapControl = MapControl;


var initializeMainElements = function(element) {
    element.html(can.view('mapTemplate', {}));
    eventToOpenID = util.getURLArgument.id;

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
    typeChanged();
}

var initializeMap = function () {
    map = new google.maps.Map(document.getElementById('mapBox'), {
        zoom : 15,
        center : new google.maps.LatLng(defaultLoc.lat, defaultLoc.lng),
        mapTypeId : google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        mapTypeControl: true
    });

    google.maps.event.addListenerOnce(map, 'idle', function() {
        var ne = map.getBounds().getNorthEast();
        var sw = map.getBounds().getSouthWest();

        $('#radius').val(util.getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()) / 3);
        $('#lat').val(util.roundNumber(map.getCenter().lat()));
        $('#lng').val(util.roundNumber(map.getCenter().lng()));
    });

    google.maps.event.addListener(map, 'dragstart', function() {
        dragging = true;
    });

    google.maps.event.addListener(map, 'dragend', function() {
        $('#lat').val(util.roundNumber(map.getCenter().lat()));
        $('#lng').val(util.roundNumber(map.getCenter().lng()));
        dragging = false;
        callUpdateMap(false);
    });

    google.maps.event.addListener(map, 'zoom_changed', function() {
        var ne = map.getBounds().getNorthEast();
        var sw = map.getBounds().getSouthWest();

        $('#radius').val(util.getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()));

        callUpdateMap(true);
    });
}

function setupSocket() {

    var socketOptions = {
        "transports" : [ "jsonp-polling" ],
        "try multiple transports" : false,
        "reconnect" : true,
        "connect timeout" : 5000,
        "reconnection limit attempts": 15
    };

    socket = io.connect('http://serenedi.com/', socketOptions);

    socket.on('getEventsResult', function(data) {
        var m = 1;  
        var n = 0;

        if(data.message != null) {

            if(typeof(data.center) != 'undefined' || data.center != null){
                map.setCenter(new google.maps.LatLng(data.center.lat, data.center.lng));
            }

            if(typeof(data.date) != 'undefined' || data.date != null) {
                $("#dateFrom").datepicker("option", "maxDate", data.date.endDate);
                $('#dateFrom').val(data.date.startDate);
                $("#dateTo").datepicker("option", "minDate", data.date.startDate);
                $('#dateTo').val(data.date.endDate);
            }

            while(m < data.message.events.length) {

             if(n >= ids.length) {
                 ids[n] = MAX_NUMBER;
             }

             if(data.message.events[m].event.id < ids[n]) {
                 if(ids[n] == MAX_NUMBER) {
                     ids.pop();
                 }

                 ids.push(data.message.events[m].event.id);
                 addMarkers(data.message.events[m].event);

                 m++;
             } else if (data.message.events[m].event.id > ids[n]) { 
                 n++;
             } else {
                 n++;
                 m++;
             }
         }

         ids.sort();
         statusObservable.status.attr('value', 0);
     } else {
         statusObservable.status.attr('value', 2);
     }
 });
}


var callUpdateMap = function (flag) {
    distCheckPass = flag;
    needUpdate = true;
}

var updateMap = function() {
    var distanceCheck = distCheckPass 
    || ((latestLoc.lat == null && latestLoc.lng == null) 
        || Math.abs(util.getDistanceFromLatLng($('#lat').val(), $('#lng').val(), latestLoc.lat, latestLoc.lng)) > $('#radius').val() / 1.5);
    var radiusCheck = $('#radius').val() < 20;

    if(needUpdate && !dragging && distanceCheck && radiusCheck && statusObservable.status.attr('value') != 1) {
        statusObservable.status.attr('value', 1);
        needUpdate = false;
        latestLoc.lat = $('#lat').val();
        latestLoc.lng = $('#lng').val();
        
        if (eventToOpenID == null || eventToOpenID == 'undefined') {
            socket.emit('getEventsCall', {
                message: { lat : $('#lat').val(),
                                lng : $('#lng').val(),
                                dateFrom : $('#dateFrom').val(),
                                dateTo : $('#dateTo').val(),
                                type : $('#categories').val(),
                                radius : $('#radius').val() }
            });
        } else {
            socket.emit('getEventsByIDCall', {
                message: { id : eventToOpenID,
                 radius : $('#radius').val()}
             });
        }
    }

    if(!radiusCheck) {
        statusObservable.status.attr('value', 3);
    }

    setTimeout(updateMap, 1000);
}

var clearMap = function () {
    closeLastOpen();

    for(n = 0; n < markers.length; n++) {
        markers[n].setMap(null);
    }

    markers = [];
    ids = [];
}

var closeLastOpen = function () {
    if (lastOpen != null) {
        lastOpen.close();
    }
    if (lastClickMarker != null) {
        lastClickMarker.setAnimation(null);
    }
    lastOpen = null;
    lastClickMarker = null;
}

var addMarkers = function (event) {
    var point = new google.maps.LatLng(event.venue.latitude, event.venue.longitude);

    var marker = new google.maps.Marker({
        position: point,
        map : map,
        title : event.title,
        animation : google.maps.Animation.DROP,
        clickable : true
    });

    marker.info = new google.maps.InfoWindow({content: '<strong>' + event.title + '</strong><br />'});
    markers.push(marker);

    google.maps.event.addListener(
        marker,
        'click',
        function() {
            closeLastOpen();

            var info = new google.maps.InfoWindow({
                content: can.view.render("infoPopUpTemplate",
                            {   
                                title: marker.getTitle(), 
                                url: {eventbrite: event.url, serenedi: 'http://www.serenedi.com/?id=' + event.id},
                                start: event.start_date.split(' ')[0],
                                end: event.end_date.split(' ')[0],
                                showAddr: event.venue.address != null || event.venue.address != '',
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

            info.open(map, marker);

            marker.setAnimation(google.maps.Animation.BOUNCE);

            lastClickMarker = marker;
            lastOpen = info;

            setTimeout(function() {
                try {
                    FB.XFBML.parse();
                } catch (ex) {
                }
            } , 100);
        }
    );

    if (event.id == eventToOpenID) {
        google.maps.event.trigger(marker, 'click');
    }
} 

var flagCheck = function(element) {
    if ($(element).prop('checked')) {
        return "1";
    } else {
        return "0";
    }
}

var typeChanged = function() {
    var result = flagCheck('#typeConfFlag');

    result += flagCheck('#typeConvFlag');
    result += flagCheck('#typeEntFlag');
    result += flagCheck('#typeFairFlag');
    result += flagCheck('#typeFoodFlag');
    result += flagCheck('#typeFundFlag');
    result += flagCheck('#typeMeetFlag');
    result += flagCheck('#typeMusicFlag');
    result += flagCheck('#typePerfFlag');
    result += flagCheck('#typeRecFlag');
    result += flagCheck('#typeReligFlag');
    result += flagCheck('#typeReunFlag');
    result += flagCheck('#typeSalesFlag');
    result += flagCheck('#typeSemiFlag');
    result += flagCheck('#typeSociFlag');
    result += flagCheck('#typeSportsFlag');
    result += flagCheck('#typeTradeFlag');
    result += flagCheck('#typeTravelFlag');
    result += flagCheck('#typeOtherFlag');

    $('#categories').val(result);
}
