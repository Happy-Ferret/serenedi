var io = require('../../../node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js');

var socketOptions = {
  'transports' : [ 'jsonp-polling' ],
  'try multiple transports' : false,
  'reconnect' : true,
  'connect timeout' : 5000,
  'reconnection limit attempts': 15
};

var SocketViewModel = function(mapControl) {
  this.socket = io.connect(SERENEDI_URL, socketOptions);
  this.mapControl = mapControl;

  var self = this;

  this.socket.on('getEventsResult', function(data) {
    self.getEventCallback(data);
  });
};

SocketViewModel.prototype.getEventCallback = function(data) {
  if (data.message !== null) {
    if (data.center) {
      this.mapControl.setMapCenter(new google.maps.LatLng(data.center.lat, data.center.lng));
    }

    if (data.date) {
      this.mapControl.setDateToSelectedEvent(data.date.startDate, data.date.endDate);
    }

    this.mapControl.addEventMarkers(data.message.events);
    this.mapControl.setStatus(0);
  } else {
    this.mapControl.setStatus(2);
  }
};

exports.SocketViewModel = SocketViewModel;