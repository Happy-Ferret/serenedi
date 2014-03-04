
exports.status = new can.Observe({value: 0, content: 'Working...', src: '/images/ajax-loader.gif'});

// 0 idle
// 1 working
// 2 no events
// 3 radius check fail
// 4 geo location fail
exports.status.bind('value', function(event, newVal, oldVal) {
  switch (newVal) {
    case 0: 
      exports.status.attr('content', 'Welcome to Serenedi!');
      exports.status.attr('src', '/images/serenedi3.ico');
      break;
    case 1:
      exports.status.attr('content', 'Working...');
      exports.status.attr('src', '/images/ajax-loader.gif');
      break;
    case 2:
      exports.status.attr('content', 'There are no events with given criterias.');
      exports.status.attr('src', '/images/warning.png');
      break;
    case 3:
      exports.status.attr('content', 'Zoom level is too high. Please zoom in to load events.');
      exports.status.attr('src', '/images/warning.png');
      break;
    case 4:
      exports.status.attr('content', 'Geo location attrival is not avaliable for this browser.');
      exports.status.attr('src', '/images/warning.png');
      break;
  }
});