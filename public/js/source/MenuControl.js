var $ = require("../../../bower_components/jquery/jquery.min.js");
var statusObservable = require('./StatusObservable.js');

exports.MenuControl = can.Control({
  init: function(element, statusObservableOption) {
    this.element.html(can.view("menuTemplate", statusObservableOption));
    $("#statusImg").popover();
  }
});