
var Q = require('q');
var argv = require('optimist').argv;
var eventbrite = require("eventbrite");
var eb_client = eventbrite({"app_key" : argv.eventbriteKey});


module.exports.callEventSearch = function(param) {
  console.log('[LOG] search events\n', param);

  var deferred = Q.defer();
  eb_client.event_search(param, function(err, data) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
};

module.exports.callEventGet = function(param) {
  console.log('[LOG] get events\n', param);

  var deferred = Q.defer();
  eb_client.event_get(param, function(err, data) {
    if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(data);
    }
  });

  return deferred.promise;
};
