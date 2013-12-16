
var $ = require('../../bower_components/jquery/jquery.min.js');
require('./third/jquery.mCustomScrollbar.js');
require('../../bower_components/jquery-ui/ui/jquery-ui.js');
require('../../bower_components/canjs/can.jquery.js');
require('../../bower_components/canjs/can.object.js');
require('../../bower_components/canjs/can.control.plugin.js');
require('../../bower_components/bootstrap/dist/js/bootstrap.min.js');

var menu = require('./source/MenuControl.js');
var map = require('./source/MapControl.js');


$(document).ready(function() {

  $( "#aboutDialog" ).dialog({
    autoOpen: false,
    width: 600,
    modal: true,
    hide: 'drop',
    show: 'drop',
  });

  new menu.MenuControl('#menuContainer');
  new map.MapControl('#main');
  $('#statusImg').tooltip();

  $("#optionButton").click(function() {
    var element = $(".optionButtonDirection");
    if (element.hasClass("glyphicon-chevron-right")) {
      element.removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-left");
    } else {
      element.removeClass("glyphicon-chevron-left").addClass("glyphicon-chevron-right");
    }
  });
});
