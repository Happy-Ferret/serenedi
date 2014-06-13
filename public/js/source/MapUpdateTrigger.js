
var mapControlObject = require('./MapControl.js');

var waitedSinceLastChange;

module.exports = function() {
  clearTimeout(waitedSinceLastChange);
  waitedSinceLastChange = setTimeout(function() {
    mapControlObject.getMapControl().updateMap();
  }, 1400);
};
