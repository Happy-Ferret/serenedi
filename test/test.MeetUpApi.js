var expect = require('expect.js');
var meetUp = require('../source/MeetUpApi.js');

describe('Testing MeetUp api', function () {
  it("buildEventSearchParam", function(done) {
    
    var searchParam = meetUp.buildEventSearchParam({lng: 1, lat: 2, radius: 3, dateFrom: '06/24/2014', dateTo: '06/28/2014'});
    expect(searchParam).to.eql({lat:2,lon:1,radius:1.86411,time:'1403593200000,1403938800000',key:undefined});

    done();
  });
});
