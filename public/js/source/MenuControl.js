var $ = require("../../../bower_components/jquery/jquery.min.js");

exports.MenuControl = can.Control({
  init: function(element, options) {
    this.element.html(can.view("menuTemplate"), {});
    $("#about").hide();
    $("#statusImg").popover();
  },
  "#homeLink click": function(el, ev) {
    $( "#aboutDialog" ).dialog( "close" );
  },
  "#aboutLink click": function(el, ev) {
    $( "#aboutDialog" ).dialog( "open" );
  }
});