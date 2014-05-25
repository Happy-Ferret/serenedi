
module.exports.getPrettyDate = function(date) {
  var month = addLeadingZero(date.getMonth() + 1);
  var day = addLeadingZero(date.getDate());

  return month + "/" + day + "/" + date.getFullYear();
};   

var addLeadingZero = function (number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
};

module.exports.roundNumber = function (val) {
  return Math.round(val * 100000) / 100000;
};

module.exports.getDistanceFromLatLng = function(lat1, lng1, lat2, lng2) {
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

module.exports.isNumber = function(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};