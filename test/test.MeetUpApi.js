var expect = require('expect.js');
var meetUp = require('../source/MeetUpApi.js');

describe('Testing MeetUp api', function () {
  it("buildEventSearchParam", function(done) {
    var searchParam = meetUp.buildEventSearchParam({lng: 1, lat: 2, radius: 3, dateFrom: '06/24/2014', dateTo: '06/28/2014'});

    // Key will 'undefined' for it is being passed in as an option argument.
    expect(searchParam).to.eql({host:'https://api.meetup.com',port:'80',path:'/2/open_events.json?lon=1&lat=2&radius=1.86411&time=1403593200000,1403938800000&key=undefined',method:'GET'});

    done();
  });
});
