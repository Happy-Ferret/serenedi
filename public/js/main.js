
var $ = require('../../bower_components/jquery/jquery.min.js');
require('./third/jquery.mCustomScrollbar.js');
require('../../bower_components/jquery-ui/ui/jquery-ui.js');
require('../../bower_components/jquery-mousewheel/jquery.mousewheel.js');
require('../../bower_components/canjs/can.jquery.js');
require('../../bower_components/canjs/can.object.js');
require('../../bower_components/canjs/can.control.plugin.js');
var about = require('./source/AboutControl.js');
var menu = require('./source/MenuControl.js');


var map;                        // initialize, setup, add markers
var ids = [];                   // set up socket
var lastClickMarker = null;     // add markers
var latestLat = null;           // update map
var latestLng = null;           // update map
var distCheckPass = null;       //update map, callUpdateMap
var eventToOpenID = null;       // initialize, update, add markers
var lastOpen;                   // add marker

var dragging = false;           // initialize, update
var needUpdate = true;          // udpate map, call update map

var MAX_NUMBER = 9007199254740992;
var socket = null;              // update map, set up socket


$(document).ready(function() {
    new menu.MenuControl('#menuContainer');
    
    var MainControl = can.Control({
        init: function(element, options) {
            initializeMainPage(this.element);
        },
        ".type change": function(el, ev) {
            typeChanged();
            callUpdateMap(true);
        },
        ".datePicker change": function(el, ev) {
            callUpdateMap(true);
        }
    });
    new MainControl('#main');
    new about.AboutControl('#about');

    windowResize();
    $(window).resize(windowResize);
});

var initializeMainPage = function(element) {
    element.html(can.view('indexTemplate', {}));
    setupSocket();  

    eventToOpenID = getURLArgument.id;

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
            callUpdateMap(true);
            $(this).trigger("change");
        }
    });

    var today = new Date();
    $("#dateFrom").val(getPrettyDate(today));
    $("#dateTo").datepicker("option", "minDate", today);

    var todayPlusOne = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
    $("#dateTo").val(getPrettyDate(todayPlusOne));
    $("#dateFrom").datepicker("option", "maxDate", todayPlusOne);

    $("#menuBox").mCustomScrollbar();
    typeChanged();

    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var lat = roundNumber(position.coords.latitude);
            var lng = roundNumber(position.coords.longitude);

            $('#lat').val(lat);
            $('#lng').val(lng);

            initializeMap(lat, lng);
        }, function err() {
            initializeMap(40.72616, -73.99973);
        });
    } else {
        initializeMap(40.72616, -73.99973);
    }
}

function initializeMap(lat, lng) {
    var point = new google.maps.LatLng(lat, lng);


    map = new google.maps.Map(document.getElementById('mapBox'), {
        zoom : 15,
        center : point,
        mapTypeId : google.maps.MapTypeId.ROADMAP
    });

    google.maps.event.addListenerOnce(map, 'idle', function() {
        var ne = map.getBounds().getNorthEast();
        var sw = map.getBounds().getSouthWest();

        $('#radius').val(getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()) / 4);
        $('#lat').val(roundNumber(map.getCenter().lat()));
        $('#lng').val(roundNumber(map.getCenter().lng()));

        updateMap();
    });

    google.maps.event.addListener(map, 'dragstart', function() {
        dragging = true;
    });

    google.maps.event.addListener(map, 'dragend', function() {
        $('#lat').val(roundNumber(map.getCenter().lat()));
        $('#lng').val(roundNumber(map.getCenter().lng()));
        dragging = false;
        callUpdateMap(false);
    });

    google.maps.event.addListener(map, 'zoom_changed', function() {
        var ne = map.getBounds().getNorthEast();
        var sw = map.getBounds().getSouthWest();

        $('#radius').val(getDistanceFromLatLng(ne.lat(), ne.lng(), sw.lat(), sw.lng()));

        callUpdateMap(true);
    });
}


function roundNumber(val) {
    return Math.round(val * 100000) / 100000;
}


function updateMap() {
    var distanceCheck = (distCheckPass || ((latestLat == null && latestLng == null) || Math
		.abs(getDistanceFromLatLng($('#lat').val(), $('#lng').val(),
				latestLat, latestLng)) > $('#radius').val() / 1.5));
    var radiusCheck = $('#radius').val() < 20;

    if(needUpdate && !dragging && distanceCheck && radiusCheck) {
        showWorking();
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
         showRadiusCheckFail();
     }

     setTimeout(updateMap, 1000);
}


function addMarkers(event) {
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


function callUpdateMap(flag) {
    distCheckPass = flag;
    needUpdate = true;
}

//TODO There has to be a better way then resizing like this... 
function windowResize() {
    $('#1andOnlyAd').css('right', (($(window).width() - 468 - 337) / 2));

    $("#mapBox").width(($(window).width() - 371) + "px");
    $("#menuBox").height(($(window).height() - 60) + "px");
    $("#mapBox").height(($(window).height() - 49) + "px");
    $("body").height(($(window).height() - 45) + "px");
}

function getPrettyDate(date) {
        var month = date.getMonth() + 1;
        var day = date.getDate();

        if (month < 10) {
            month = "0" + month;
        } 
        if (day < 10) {
            day = "0" + day;
        } 

        return month + '/' + day + '/' + date.getFullYear();
}   


function getDistanceFromLatLng(lat1, lng1, lat2, lng2) {
    var R = 6371;   // Radius of the earth in KM
    var dLat = deg2rad(lat2 - lat1);
    var dLng = deg2rad(lng2 - lng1);
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return  R * c;
}

function deg2rad(deg) { 
    return deg * (Math.PI / 180);
}


//TODO again...  need better way of handling....
function typeChanged() {
	var result = "";

	if ($('#typeConfFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeConvFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeEntFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeFairFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeFoodFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeFundFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeMeetFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeMusicFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typePerfFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeRecFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeReligFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeReunFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeSalesFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeSemiFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeSociFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeSportsFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeTradeFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeTravelFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}
	if ($('#typeOtherFlag').prop('checked')) {
		result += "1";
	} else {
		result += "0";
	}

	$('#categories').val(result);
}

function showWorking() {
    if ($('#working').html().indexOf('Working') == -1) {
        $('#working').html("<img title='Working on loading more events...' src='images/ajax-loader.gif' width='20px'/>");
        $('#working').tooltip();
    }
}

function showRadiusCheckFail() {
    if ($('#working').html().indexOf('zoom') == -1) {
        $('#working').html("<img title='Please zoom in to load events...' src='images/warning.png' />");
        $('#working').tooltip();
    }
}

function showNoEvents() {
    if ($('#working').html().indexOf('events') == -1) {
        $('#working').html("<img title='There are no events with given criterias...' src='images/warning.png' />");
        $('#working').tooltip();
    }
}

function hideWorking() {
    $('#working').html("");
}

var getURLArgument = function () {
    // This function is anonymous, is executed immediately and 
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]], pair[1] ];
            query_string[pair[0]] = arr;
	        // If third or later entry with this name
        } else {
            query_string[pair[0]].push(pair[1]);
        }
    } 
    return query_string;
} ();



function setupSocket() {
    socket = io.connect('http://serenedi.com/');

    socket.on('getEventsResult', function(data) {
        var m = 1;  
        var n = 0;

        if(data.message != null) {

            if(typeof(data.center) != 'undefined' || data.center != null){
                //console.log(data.center.lat + "/" + data.center.lng);
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
           showNoEvents();
        }   
        hideWorking();
    });
}
