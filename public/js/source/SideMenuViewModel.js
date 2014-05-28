
var SideMenuViewModel = function(sideMenuTemplate, mapModel) {
  this.mapModel = mapModel;
  $('#sideMenu').html(can.view(sideMenuTemplate, this.mapModel));

  this.dateFromDom = $('#dateFrom');
  this.dateToDom = $('#dateTo');

  this.dateFromDom.datepicker({
    defaultDate : this.mapModel.prop.dateFrom,
    changeMonth : true,
    changeYear : true,
    numberOfMonths : 1,
    onSelect : function(selectedDate) {
      this.dateToDom.datepicker('option', 'minDate', selectedDate);
      $(this).trigger('change');
    },
    maxDate: this.mapModel.prop.dateTo
  });
  this.dateToDom.datepicker({
    defaultDate : this.mapModel.prop.dateFrom,
    changeMonth : true,
    changeYear : true,
    numberOfMonths : 1,
    onSelect : function(selectedDate) {
      this.dateFromDom.datepicker('option', 'maxDate', selectedDate);
      $(this).trigger('change');
    },
    minDate: this.mapModel.prop.dateFrom
  });

  $('#loadMyLocation').popover();
  $('#sideMenu').mCustomScrollbar({
    advanced:{
        autoScrollOnFocus: false
    }
  });
};
module.exports = SideMenuViewModel;

SideMenuViewModel.prototype.setDateToSelectedEvent = function(startDate, endDate) {
  this.mapModel.prop.attr('dateFrom', startDate);
  this.mapModel.prop.attr('dateTo', endDate);
  this.dateFromDom.datepicker('option', 'maxDate', endDate);
  this.dateToDom.datepicker('option', 'minDate', startDate);
};