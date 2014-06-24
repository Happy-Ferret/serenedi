// As with many other codes in here, this one is from Ungit.
var signals = require('signals');

var programEvents = new signals.Signal();
module.exports = programEvents;

programEvents.add(function(event) {
  // console.log('Event:', event);
});
