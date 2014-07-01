var $ = require('../../bower_components/jquery/jquery.min.js');
require('./third/jquery.mCustomScrollbar.js');
require('../../bower_components/canjs/can.jquery.js');
require('../../bower_components/bootstrap/dist/js/bootstrap.min.js');
require('../../bower_components/jquery-mousewheel/jquery.mousewheel.js');
require('../../bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js');

var statusModel = require('./source/StatusViewModel.js').getStatusViewModel();

$(document).ready(function() {
  require('./source/MapControl.js').getMapControl();
  $('#menuContainer').html(can.view("topMenuTemplate", statusModel.status));
  $('.add-popover').popover();

  $("#optionButton").click(function() {
    var element = $(".optionButtonDirection");
    var shiftElement = $(".optionShiftElement");

    if (element.hasClass("glyphicon-chevron-right")) {
      element.removeClass("glyphicon-chevron-right").addClass("glyphicon-chevron-left");

      shiftElement.animate({
        left: "+=300"
      });

    } else {
      element.removeClass("glyphicon-chevron-left").addClass("glyphicon-chevron-right");
      shiftElement.animate({
        left: "-=300"
      });
    }
  });
});
