
exports.getEventbriteDateFormat = function (date) {
  if(date) {
    var dateArray = date.split("/");
    return dateArray[2] + "-" + dateArray[0] + "-" + dateArray[1];
  }
  return null;
};

exports.getPrettyDate = function (date) {
  var month = addLeadingZero(date.getMonth() + 1);
  var day = addLeadingZero(date.getDate());

  return month + "/" + day + "/" + date.getFullYear();
};

var addLeadingZero = function (number) {
  if (number < 10) {
    return '0' + number;
  }
  return number;
}

var flagCheck = function(flag, category, types) {
  if (flag ==='1') {
    types.push(category);
  }
};

//TODO There is a better way of handling this...  
exports.getTypeString = function(type) {
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
