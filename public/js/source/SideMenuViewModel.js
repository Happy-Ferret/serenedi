var SIDE_MENU_TEMPLATE = 'sideMenuTemplate';
var mapVM = require('./MapViewModel.js').getMapViewModel();

var sideMenuViewModel;

var SideMenuViewModel = function() {
  $('#sideMenu').html(can.view(SIDE_MENU_TEMPLATE, mapVM));

  this.dateFromDom = $('#dateFrom');
  this.dateToDom = $('#dateTo');

  this.dateFromDom.datepicker({
    defaultDate : mapVM.prop.dateFrom,
    changeMonth : true,
    changeYear : true,
    numberOfMonths : 1,
    onSelect : function(selectedDate) {
      this.dateToDom.datepicker('option', 'minDate', selectedDate);
      $(this).trigger('change');
    },
    maxDate: mapVM.prop.dateTo
  });
  this.dateToDom.datepicker({
    defaultDate : mapVM.prop.dateFrom,
    changeMonth : true,
    changeYear : true,
    numberOfMonths : 1,
    onSelect : function(selectedDate) {
      this.dateFromDom.datepicker('option', 'maxDate', selectedDate);
      $(this).trigger('change');
    },
    minDate: mapVM.prop.dateFrom
  });

  $('#loadMyLocation').popover();
  $('#sideMenu').mCustomScrollbar({
    advanced:{
        autoScrollOnFocus: false
    }
  });
};

module.exports.getSideMenuViewModel = function() {
  if(!sideMenuViewModel) {
    sideMenuViewModel = new SideMenuViewModel();
  }
  return sideMenuViewModel;
};

SideMenuViewModel.prototype.setDateToSelectedEvent = function(startDate, endDate) {
  mapVM.prop.attr('dateFrom', startDate);
  mapVM.prop.attr('dateTo', endDate);
  this.dateFromDom.datepicker('option', 'maxDate', endDate);
  this.dateToDom.datepicker('option', 'minDate', startDate);
};
