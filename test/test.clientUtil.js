var expect = require('expect.js');
var util = require('../public/js/source/Util.js');

describe('Testing Client side Util class.', function () {
  it("getPrettyDate test", function(done) {
    expect(util.getPrettyDate(new Date(2014,5,25))).to.be("06/25/2014");
    expect(util.getPrettyDate(new Date(2014,5,5))).to.be("06/05/2014");
    expect(util.getPrettyDate(new Date(2014,11,25))).to.be("12/25/2014");

    done();
  });
});