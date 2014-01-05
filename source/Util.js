
exports.getEventbriteDateRange = function (from, to) {
  var fromArray = from.split("/");
  var toArray = to.split("/");

  return fromArray[2] + "-" + fromArray[0] + "-" + fromArray[1] + " " + toArray[2] + "-" + toArray[0] + "-" + toArray[1];
}

//TODO There is a better way of handling this...  
exports.getTypeString = function(type) {
  var typeStr = "";

  if (type.charAt(0) == "1") {
    typeStr += "conference, ";
  }

  if (type.charAt(1) == "1") {
    typeStr += "conventions, ";
  }

  if (type.charAt(2) == "1") {
    typeStr += "entertainment, ";
  }

  if (type.charAt(3) == "1") {
    typeStr += "fairs, ";
  }

  if (type.charAt(4) == "1") {
    typeStr += "food, ";
  }

  if (type.charAt(5) == "1") {
    typeStr += "fundraisers, ";
  }

  if (type.charAt(6) == "1") {
    typeStr += "meetings, ";
  }

  if (type.charAt(7) == "1") {
    typeStr += "music, ";
  }

  if (type.charAt(8) == "1") {
    typeStr += "performances, ";
  }

  if (type.charAt(9) == "1") {
    typeStr += "recreation, ";
  }

  if (type.charAt(10) == "1") {
    typeStr += "religion, ";
  }

  if (type.charAt(11) == "1") {
    typeStr += "reunions, ";
  }

  if (type.charAt(12) == "1") {
    typeStr += "sales, ";
  }

  if (type.charAt(13) == "1") {
    typeStr += "social, ";
  }

  if (type.charAt(14) == "1") {
    typeStr += "sports, ";
  }

  if (type.charAt(15) == "1") {
    typeStr += "tradeshows, ";
  }

  if (type.charAt(16) == "1") {
    typeStr += "travel, ";
  }

  if (type.charAt(17) == "1") {
    typeStr += "other";
  }

  return typeStr;
}
