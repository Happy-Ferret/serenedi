
var $ = require('../../../bower_components/jquery/jquery.min.js');

var status = new can.Observe({value: 0});
exports.status = status;

// 0 idle
// 1 working
// 2 no events
// 3 radius check fail
status.bind('change', function(event, attr, how, newVal, oldVal) {
    console.log(newVal);
    if (newVal == 0) {
    	showNormal();
    } else if (newVal == 1) {
    	showWorking();
    } else if (newVal == 2) {
    	showNoEvents();
    } else if (newVal == 3) {
    	showZoomCheckFail();
    }
});

var showWorking = function () {
    $('#statusImg').attr('title', 'Working...')
        .attr('src', '/images/ajax-loader.gif');
}

var showZoomCheckFail = function () {
    $('#statusImg').attr('title', 'Zoom level is too high. Please zoom in to load events.')
        .attr('src', '/images/warning.png');
}

var showNoEvents = function () {
    $('#statusImg').attr('title', 'There are no events with given criterias.')
        .attr('src', '/images/warning.png');
}

var showNormal = function () {
    $('#statusImg').attr('title', 'There are no events with given criterias.')
        .attr('src', '/images/serenedi3.ico');
}