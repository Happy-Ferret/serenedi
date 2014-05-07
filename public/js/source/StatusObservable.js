require('../../../bower_components/jquery/jquery.min.js');
require('../../../bower_components/canjs/can.jquery.js');

module.exports.status = new can.Observe({value: 0, content: 'Working...', src: '/images/ajax-loader.gif'});

module.exports.CONST = {
  'NORMAL': 0,
  'WORKING': 1,
  'NO_EVENTS': 2,
  'ZOOM_ERROR': 3,
  'GEO_ERROR': 4
};

// 0 idle
// 1 working
// 2 no events
// 3 radius check fail
// 4 geo location fail
module.exports.status.bind('value', function(event, newVal, oldVal) {
  switch (newVal) {
    case exports.CONST.NORMAL: 
      exports.status.attr('content', 'Welcome to Serenedi!');
      exports.status.attr('src', '/images/serenedi3.ico');
      break;
    case exports.CONST.WORKING:
      exports.status.attr('content', 'Working...');
      exports.status.attr('src', '/images/ajax-loader.gif');
      break;
    case exports.CONST.NO_EVENTS:
      exports.status.attr('content', 'There are no events with given criterias.');
      exports.status.attr('src', '/images/warning.png');
      break;
    case exports.CONST.ZOOM_ERROR:
      exports.status.attr('content', 'Zoom level is too high. Please zoom in to load events.');
      exports.status.attr('src', '/images/warning.png');
      break;
    case exports.CONST.GEO_ERROR:
      exports.status.attr('content', 'Geo location attrival is not avaliable for this browser.');
      exports.status.attr('src', '/images/warning.png');
      break;
  }
});