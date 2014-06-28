var expect = require('expect.js');

var util = require('../shared/Util.js');

describe('Testing Server side Util class.', function () {
  it("getTypeString test", function(done) {
    expect(util.getTypeString("0000000000000000000")).to.be("");
    expect(util.getTypeString("1000000000000000000")).to.be("conferences");
    expect(util.getTypeString("0100000000000000000")).to.be("conventions");
    expect(util.getTypeString("0010000000000000000")).to.be("entertainment");
    expect(util.getTypeString("0001000000000000000")).to.be("fairs");
    expect(util.getTypeString("0000100000000000000")).to.be("food");
    expect(util.getTypeString("0000010000000000000")).to.be("fundraisers");
    expect(util.getTypeString("0000001000000000000")).to.be("meetings");
    expect(util.getTypeString("0000000100000000000")).to.be("music");
    expect(util.getTypeString("0000000010000000000")).to.be("performances");
    expect(util.getTypeString("0000000001000000000")).to.be("recreation");
    expect(util.getTypeString("0000000000100000000")).to.be("religion");
    expect(util.getTypeString("0000000000010000000")).to.be("reunions");
    expect(util.getTypeString("0000000000001000000")).to.be("sales");

    expect(util.getTypeString("0000000000000100000")).to.be("seminars");
    expect(util.getTypeString("0000000000000010000")).to.be("social");
    expect(util.getTypeString("0000000000000001000")).to.be("sports");
    expect(util.getTypeString("0000000000000000100")).to.be("tradeshows");
    expect(util.getTypeString("0000000000000000010")).to.be("travel");
    expect(util.getTypeString("0000000000000000001")).to.be("other");

    expect(util.getTypeString("1100000000000000000")).to.be("conferences, conventions");
    expect(util.getTypeString("1100000000000000010")).to.be("conferences, conventions, travel");

    expect(util.getTypeString(null)).to.be('conferences, conventions, entertainment, fairs, food, fundraisers, meetings, music, performances, recreation, religion, reunions, sales, seminars, social, sports, tradeshows, travel, other');
    done();
  });

  it("getEventbriteDateFormat test", function(done) {
    expect(util.getEventbriteDateFormat("01/02/2012")).to.be("2012-01-02");
    expect(util.getEventbriteDateFormat(null)).to.be(null);
    done();
  });

  it("PrettyDate function test", function(done) {
    var date = new Date(2014, 0, 1);
    expect(util.getPrettyDate(date)).to.be("01/01/2014");

    date = new Date(2014, 0, 10);
    expect(util.getPrettyDate(date)).to.be("01/10/2014");

    date = new Date(2014, 9, 10);
    expect(util.getPrettyDate(date)).to.be("10/10/2014");

    date = new Date(2014, 9, 9);
    expect(util.getPrettyDate(date)).to.be("10/09/2014");

    date = new Date(2014, 8, 9);
    expect(util.getPrettyDate(date)).to.be("09/09/2014");

    done();
  });
});
