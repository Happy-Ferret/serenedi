var statusObservable = require('./StatusObservable.js');

exports.MenuControl = can.Control({
  init: function(element, statusObservableOption) {
    element.html(can.view("menuTemplate", statusObservableOption));
  }
});