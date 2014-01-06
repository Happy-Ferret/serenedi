
exports.getPrettyDate = function(date) {
  var month = date.getMonth() + 1;
  var day = date.getDate();

  if (month < 10) {
    month = "0" + month;
  } 
  if (day < 10) {
    day = "0" + day;
  } 

  return month + "/" + day + "/" + date.getFullYear();
};   

exports.roundNumber = function (val) {
  return Math.round(val * 100000) / 100000;
};

exports.getDistanceFromLatLng = function(lat1, lng1, lat2, lng2) {
  var R = 6371;   // Radius of the earth in KM
  var dLat = deg2rad(lat2 - lat1);
  var dLng = deg2rad(lng2 - lng1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return  R * c;
};

var deg2rad = function (deg) { 
  return deg * (Math.PI / 180);
};

exports.getURLArgument = function () {
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

exports.isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};