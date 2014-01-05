
exports.getEventbriteDateRange = function (from, to) {
  var fromArray = from.split("/");
  var toArray = to.split("/");

  return fromArray[2] + "-" + fromArray[0] + "-" + fromArray[1] + " " + toArray[2] + "-" + toArray[0] + "-" + toArray[1];
};

//TODO There is a better way of handling this...  
exports.getTypeString = function(type) {
  var types = [];

  if (type.charAt(0) === "1") {
    types.push("conference");
  }

  if (type.charAt(1) === "1") {
    types.push("conventions");
  }

  if (type.charAt(2) === "1") {
    types.push("entertainment");
  }

  if (type.charAt(3) === "1") {
    types.push("fairs");
  }

  if (type.charAt(4) === "1") {
    types.push("food");
  }

  if (type.charAt(5) === "1") {
    types.push("fundraisers");
  }

  if (type.charAt(6) === "1") {
    types.push("meetings");
  }

  if (type.charAt(7) === "1") {
    types.push("music");
  }

  if (type.charAt(8) === "1") {
    types.push("performances");
  }

  if (type.charAt(9) === "1") {
    types.push("recreation");
  }

  if (type.charAt(10) === "1") {
    types.push("religion");
  }

  if (type.charAt(11) === "1") {
    types.push("reunions");
  }

  if (type.charAt(12) === "1") {
    types.push("sales");
  }

  if (type.charAt(13) === "1") {
    types.push("social");
  }

  if (type.charAt(14) === "1") {
    types.push("sports");
  }

  if (type.charAt(15) === "1") {
    types.push("tradeshows");
  }

  if (type.charAt(16) === "1") {
    types.push("travel");
  }

  if (type.charAt(17) === "1") {
    types.push("other");
  }

  return types.join(", ");
};
