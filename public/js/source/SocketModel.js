var io = require('../../../node_modules/socket.io/node_modules/socket.io-client/dist/socket.io.js');

var socketOptions = {
  'transports' : [ 'jsonp-polling' ],
  'try multiple transports' : false,
  'reconnect' : true,
  'connect timeout' : 5000,
  'reconnection limit attempts': 15
};

var SocketModel = function(getEventCallback) {
  this.socket = io.connect(SERENEDI_URL, socketOptions);

  this.socket.on('getEventsResult', function(data) {
    getEventCallback(data);
  });
};

exports.SocketModel = SocketModel;