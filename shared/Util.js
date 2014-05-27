
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

module.exports.getEventbriteDateFormat = function (date) {
  if(date) {
    var dateArray = date.split("/");
    return dateArray[2] + "-" + dateArray[0] + "-" + dateArray[1];
  }
  return null;
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

module.exports.getTypeString = function(type) {
  if (!type) {
    return '1111111111111111111';
  }

  var types = [];

  flagCheck(type.charAt(0), "conferences", types);
  flagCheck(type.charAt(1), "conventions", types);
  flagCheck(type.charAt(2), "entertainment", types);
  flagCheck(type.charAt(3), "fairs", types);
  flagCheck(type.charAt(4), "food", types);
  flagCheck(type.charAt(5), "fundraisers", types);
  flagCheck(type.charAt(6), "meetings", types);
  flagCheck(type.charAt(7), "music", types);
  flagCheck(type.charAt(8), "performances", types);
  flagCheck(type.charAt(9), "recreation", types);
  flagCheck(type.charAt(10), "religion", types);
  flagCheck(type.charAt(11), "reunions", types);
  flagCheck(type.charAt(12), "sales", types);
  flagCheck(type.charAt(13), "seminars", types);
  flagCheck(type.charAt(14), "social", types);
  flagCheck(type.charAt(15), "sports", types);
  flagCheck(type.charAt(16), "tradeshows", types);
  flagCheck(type.charAt(17), "travel", types);
  flagCheck(type.charAt(18), "other", types);

  return types.join(", ");
};

var flagCheck = function(flag, category, types) {
  if (flag ==='1') {
    types.push(category);
  }
};