
var $ = require('../../../bower_components/jquery/jquery.min.js');

var status = new can.Observe({status: 0});
exports.status = status;

// 0 idle
// 1 working
// 2 no events
// 3 radius check fail
status.bind('change', function(event, attr, how, newVal, oldVal) {
    if (newVal == 0) {
    	hideWorking();
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
        .attr('src', 'images/ajax-loader.gif')
        .show();
}

var showZoomCheckFail = function () {
    $('#statusImg').attr('title', 'Zoom level is too high. Please zoom in to load events.')
        .attr('src', 'images/warning.png')
        .show();
}

var showNoEvents = function () {
    $('#statusImg').attr('title', 'There are no events with given criterias.')
        .attr('src', 'images/warning.png')
        .show();
}

var hideWorking = function () {
    $('#statusImg').hide();
}