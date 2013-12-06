var $ = require('../../../bower_components/jquery/jquery.min.js');

var MenuControl = can.Control({
    init: function(element, options) {
        this.element.html(can.view('menuTemplate'), {});
        $('#about').hide();
    },
    '.brand click': function(el, ev) {
        $( "#aboutDialog" ).dialog( "close" );
    },
    '.sub-brand click': function(el, ev) {
        $( "#aboutDialog" ).dialog( "open" );
    }
});
exports.MenuControl = MenuControl;