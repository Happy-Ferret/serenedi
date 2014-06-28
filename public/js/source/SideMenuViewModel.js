var mapVM = require('./MapViewModel.js').getMapViewModel();
var util = require('../../../shared/Util.js');
var programEvents = require('./ProgramEvents.js');

var SIDE_MENU_TEMPLATE = 'sideMenuTemplate';
var today = new Date();
var weekAfter = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);

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
  this.sideMenuProp = new can.Observe({types: '1111111111111111111',
                              dateFrom: util.getPrettyDate(today),
                              dateTo: util.getPrettyDate(weekAfter)});
  this.waitedSinceLastChange = undefined;

  $('#sideMenu').html(can.view(SIDE_MENU_TEMPLATE, {sideMenuVM: this, mapVM: mapVM}));

  var self = this;

  this.sideMenuProp.bind('change', function(event, attr, how, newVal, oldVal) {
    mapVM.clearMap();
    mapVM.distCheckPass = true;
    programEvents.dispatch({ event: 'updateMap' });
  });

  this.types.bind('change', function(event, attr, how, newVal, oldVal) {
    self.sideMenuProp.attr('types', (this.conf ? '1' : '0') +
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


  this.dates = $('#datepicker');

  this.dates.datepicker({
    todayBtn: true,
    autoclose: true,
    todayHighlight: true
  }).on('hide', function(e) {
    var fromDate = self.dateFromDom.datepicker('getDate');
    var toDate = self.dateToDom.datepicker('getDate');

    self.dateFromDom.datepicker('setEndDate', toDate);
    self.dateToDom.datepicker('setStartDate', fromDate);

    self.sideMenuProp.attr('dateFrom', util.getPrettyDate(fromDate));
    self.sideMenuProp.attr('dateTo', util.getPrettyDate(toDate));
  });

  this.dateFromDom = $('#dateFrom');
  this.dateToDom = $('#dateTo');
  this.dateFromDom
    .datepicker('setDate', self.sideMenuProp.dateFrom)
    .datepicker('setEndDate', self.sideMenuProp.dateTo);
  this.dateToDom
    .datepicker('setDate', self.sideMenuProp.dateTo)
    .datepicker('setStartDate', self.sideMenuProp.dateFrom);

  $('#loadMyLocation').popover();
  $('#sideMenu').mCustomScrollbar({
    advanced:{
        autoScrollOnFocus: false
    }
  });
};

SideMenuViewModel.prototype.setDateToSelectedEvent = function(startDate, endDate) {
  this.sideMenuProp.attr('dateFrom', util.getPrettyDate(new Date(startDate)));
  this.sideMenuProp.attr('dateTo', util.getPrettyDate(new Date(endDate)));
};
