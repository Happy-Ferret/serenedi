var $ = require('../../../bower_components/jquery/jquery.min.js');
var util = require('./Util.js');
var statusObservable = require('./StatusObservable.js');
require('../../bower_components/jquery-mousewheel/jquery.mousewheel.js');

var map;
var ids = [];
var lastClickMarker = null;
var latestLat = null;
var latestLng = null;
var distCheckPass = null;
var eventToOpenID = null;
var lastOpen;
var dragging = false;
var needUpdate = true;
var MAX_NUMBER = 9007199254740992;
var socket = null;


var MainControl = can.Control({
    init: function(element, options) {
    	setupSocket();
        initializeMainElements(this.element);

	    if(navigator.geolocation) {
	        navigator.geolocation.getCurrentPosition(function (position) {
	            var lat = util.roundNumber(position.coords.latitude);
	            var lng = util.roundNumber(position.coords.longitude);

	            $('#lat').val(lat);
	            $('#lng').val(lng);

	            initializeMap(lat, lng);
	        }, function err() {
	            initializeMap(40.72616, -73.99973);
	        });
	    } else {
	        initializeMap(40.72616, -73.99973);
	    }
    },
    ".type change": function(el, ev) {
        typeChanged();
        callUpdateMap(true);
    },
    ".datePicker change": function(el, ev) {
        callUpdateMap(true);
    }
});
exports.MainControl = MainControl;


var initializeMainElements = function(element) {
    element.html(can.view('indexTemplate', {}));
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

    $("#menuBox").mCustomScrollbar();
    typeChanged();
}

var initializeMap = function (lat, lng) {
    var point = new google.maps.LatLng(lat, lng);


    map = new google.maps.Map(document.getElementById('mapBox'), {
        zoom : 15,
        center : point,
        mapTypeId : google.maps.MapTypeId.ROADMAP
    });

    google.maps.event.addListenerOnce(map, 'idle', function() {
        var ne = map.getBounds().getNorthEast();
        var sw = map.getBounds().getSouthWest();

        $('#radius').val(util.getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()) / 4);
        $('#lat').val(util.roundNumber(map.getCenter().lat()));
        $('#lng').val(util.roundNumber(map.getCenter().lng()));

        updateMap();
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
    socket = io.connect('http://serenedi.com/');

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
        } else {
        	statusObservable.status.attr('value', 2);
        }
        statusObservable.status.attr('value', 0);
    });
}


var callUpdateMap = function (flag) {
    distCheckPass = flag;
    needUpdate = true;
}

var updateMap = function() {
    var distanceCheck = (distCheckPass || ((latestLat == null && latestLng == null) || Math
		.abs(util.getDistanceFromLatLng($('#lat').val(), $('#lng').val(),
				latestLat, latestLng)) > $('#radius').val() / 1.5));
    var radiusCheck = $('#radius').val() < 20;

    if(needUpdate && !dragging && distanceCheck && radiusCheck && statusObservable.status.attr('value') != 1) {
        statusObservable.status.attr('value', 1);
        needUpdate = false;
        latestLat = $('#lat').val();
        latestLng = $('#lng').val();
        
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


   google.maps.event.addListener(
       marker,
       'click',
       function() {
           if (lastOpen != null) {
               lastOpen.close();
           }
           if (lastClickMarker != null) {
               lastClickMarker.setAnimation(null);
           }
           
	//TODO USE CSS FOR THE LOVE OF MOTHER TERESA
           var content = '<div id="infoTable" class="" style="font-size:10pt; font-family: Helvetica; width: 440px; height: 500px; overflow: hidden;">';
           content += '<table width="100%" height="100%" cellpadding="0" cellspacing="0" style="overflow:hidden; padding-left: 5px; margin-left: 15px;" >';
           content += '<tr><td colspan="2"><strong>' + marker.getTitle() + '</strong></td><br />';
           content += '<tr><td width="75px">URL: </td><td><a href="' + event.url	+ '" target="_blank">' + event.url + '</a><br /><a target="_blank" href=http://www.serenedi.com/?id=' + event.id + '>http://www.serenedi.com/?id=' + event.id + '</a>' + '</td></tr>';
           content += '<tr><td>Start: </td><td>' + event.start_date.split(' ')[0] + '</td></tr>';
           if (event.end_date != null) {
               content += '<tr><td>End: </td><td>' + event.end_date.split(' ')[0] + '</td></tr>';
           }
           if (event.venue.address != null || event.venue.address != '') {
               content += '<tr><td>Address: </td><td>' + event.venue.address + ' ' + event.venue.address_2 + '</td></tr>';
               content += '<tr><td></td><td>' + event.venue.city + ', ' + event.venue.region + ' ' + event.venue.postalcode + '</td></tr>';
           }
           content += '<tr><td>Category: </td><td>' + event.category + '</td></tr>';
           content += '<tr><td colspan="2" align="left"><div class="fb-like" data-href="http://www.serenedi.com/?id=' + event.id + '" data-send="true" data-layout="button_count" data-width="350" data-show-faces="true"></div></td></tr>';
           content += '<tr><td colspan="2"><div> <script src="http://connect.facebook.net/en_US/all.js#appId=5006939796&amp;xfbml=1"></script><fb:comments href="www.serenedi.com/?id=' + event.id + '" num_posts="2" width="400"> </script></div></td></tr>';
           content += '</table></div>';

           var info = new google.maps.InfoWindow();
           info.setContent(content);

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
       });

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
