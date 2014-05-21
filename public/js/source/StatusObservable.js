require('../../../bower_components/jquery/jquery.min.js');
require('../../../bower_components/canjs/can.jquery.js');

var statusObject;

var StatusObject = function() {
  this.status = new can.Observe({value: 0, content: 'Working...', src: '/images/ajax-loader.gif'});
  this.CONST = {
    'NORMAL': 0,
    'WORKING': 1,
    'NO_EVENTS': 2,
    'ZOOM_ERROR': 3,
    'GEO_ERROR': 4
  };

  var self = this;

  this.setStatus = function(value) {
    self.status.attr('value', value);
  };
  this.getStatus = function(value) {
    return self.status.attr('value');
  };

  // 0 idle
  // 1 working
  // 2 no events
  // 3 radius check fail
  // 4 geo location fail
  this.status.bind('value', function(event, newVal, oldVal) {
    switch (newVal) {
      case self.CONST.NORMAL: 
        self.status.attr('content', 'Welcome to Serenedi!');
        self.status.attr('src', '/images/serenedi3.ico');
        break;
      case self.CONST.WORKING:
        self.status.attr('content', 'Working...');
        self.status.attr('src', '/images/ajax-loader.gif');
        break;
      case self.CONST.NO_EVENTS:
        self.status.attr('content', 'There are no events with given criterias.');
        self.status.attr('src', '/images/warning.png');
        break;
      case self.CONST.ZOOM_ERROR:
        self.status.attr('content', 'Zoom level is too high. Please zoom in to load events.');
        self.status.attr('src', '/images/warning.png');
        break;
      case self.CONST.GEO_ERROR:
        self.status.attr('content', 'Geo location attrival is not avaliable for this browser.');
        self.status.attr('src', '/images/warning.png');
        break;
    }
  });
};

module.exports.getStatusObject = function() {
  if (!statusObject) {
    statusObject = new StatusObject();
  }

  return statusObject;
};