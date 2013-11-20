var $ = require('../../../bower_components/jquery/jquery.min.js');

var MenuControl = can.Control({
    init: function(element, options) {
        this.element.html(can.view('menuTemplate'), {});
        $('#about').hide();
    },
    '.brand click': function(el, ev) {
        $('#main').show();
        $('#about').hide();
    },
    '.sub-brand click': function(el, ev) {
        $('#main').hide();
        $('#about').show();
    }
});

exports.MenuControl = MenuControl;