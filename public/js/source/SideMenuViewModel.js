var mapVM = require('./MapViewModel.js').getMapViewModel();
var util = require('../../../shared/Util.js');

var SIDE_MENU_TEMPLATE = 'sideMenuTemplate';

var sideMenuViewModel;

module.exports.getSideMenuViewModel = function() {
  if(!sideMenuViewModel) {
    sideMenuViewModel = new SideMenuViewModel();
  }
  return sideMenuViewModel;
};

var SideMenuViewModel = function() {
  this.types = new can.Observe({conf: true,
                                                conv: true,
                                                ent: true,
                                                fair: true,
                                                food: true,
                                                fund: true,
                                                meet: true,
                                                music: true,
                                                perf: true,
                                                rec: true,
                                                relig: true,
                                                reun: true,
                                                sales: true,
                                                semi: true,
                                                soci: true,
                                                sports: true,
                                                trade: true,
                                                travel: true,
                                                other: true});
  this.dateFromDom = $('#dateFrom');
  this.dateToDom = $('#dateTo');

  $('#sideMenu').html(can.view(SIDE_MENU_TEMPLATE, mapVM));
  var self = this;

  this.types.bind('change', function(event, attr, how, newVal, oldVal) {
    self.prop.attr('types', (this.conf ? '1' : '0') +
                                      (this.conv ? '1' : '0') +
                                      (this.ent ? '1' : '0') +
                                      (this.fair ? '1' : '0') +
                                      (this.food ? '1' : '0') +
                                      (this.fund ? '1' : '0') +
                                      (this.meet ? '1' : '0') +
                                      (this.music? '1' : '0') +
                                      (this.perf ? '1' : '0') +
                                      (this.rec ? '1' : '0') +
                                      (this.relig ? '1' : '0') +
                                      (this.reun ? '1' : '0') +
                                      (this.sales ? '1' : '0') +
                                      (this.semi ? '1' : '0') +
                                      (this.soci ? '1' : '0') +
                                      (this.sports ? '1' : '0') +
                                      (this.trade ? '1' : '0') +
                                      (this.travel ? '1' : '0') +
                                      (this.other ? '1' : '0'));
  });

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

SideMenuViewModel.prototype.setDateToSelectedEvent = function(startDate, endDate) {
  mapVM.prop.attr('dateFrom', startDate);
  mapVM.prop.attr('dateTo', endDate);
  this.dateFromDom.datepicker('option', 'maxDate', endDate);
  this.dateToDom.datepicker('option', 'minDate', startDate);
};
