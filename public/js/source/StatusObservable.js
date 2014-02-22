
exports.status = new can.Observe({value: 0, content: 'Working...', src: '/images/ajax-loader.gif'});

// 0 idle
// 1 working
// 2 no events
// 3 radius check fail
// 4 geo location fail
status.bind('change', function(event, attr, how, newVal, oldVal) {
  switch (newVal) {
    case 0: 
      status.attr('content', 'Welcome to Serenedi!');
      status.attr('src', '/images/serenedi3.ico');
      break;
    case 1:
      status.attr('content', 'Working...');
      status.attr('src', '/images/ajax-loader.gif');
      break;
    case 2:
      status.attr('content', 'There are no events with given criterias.');
      status.attr('src', '/images/warning.png');
      break;
    case 3:
      status.attr('content', 'Zoom level is too high. Please zoom in to load events.');
      status.attr('src', '/images/warning.png');
      break;
    case 4:
      status.attr('content', 'Geo location attrival is not avaliable for this browser.');
      status.attr('src', '/images/warning.png');
      break;
  }
});