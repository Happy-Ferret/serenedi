var expect = require('expect.js');

var Util = require('../source/Util.js');

describe('Testing Server side Util class.', function () {
  it("getTypeString test", function(done) {
    expect(Util.getTypeString("0000000000000000000")).to.be("");
    expect(Util.getTypeString("1000000000000000000")).to.be("conferences");
    expect(Util.getTypeString("0100000000000000000")).to.be("conventions");
    expect(Util.getTypeString("0010000000000000000")).to.be("entertainment");
    expect(Util.getTypeString("0001000000000000000")).to.be("fairs");
    expect(Util.getTypeString("0000100000000000000")).to.be("food");
    expect(Util.getTypeString("0000010000000000000")).to.be("fundraisers");
    expect(Util.getTypeString("0000001000000000000")).to.be("meetings");
    expect(Util.getTypeString("0000000100000000000")).to.be("music");
    expect(Util.getTypeString("0000000010000000000")).to.be("performances");
    expect(Util.getTypeString("0000000001000000000")).to.be("recreation");
    expect(Util.getTypeString("0000000000100000000")).to.be("religion");
    expect(Util.getTypeString("0000000000010000000")).to.be("reunions");
    expect(Util.getTypeString("0000000000001000000")).to.be("sales");

    expect(Util.getTypeString("0000000000000100000")).to.be("seminars");
    expect(Util.getTypeString("0000000000000010000")).to.be("social");
    expect(Util.getTypeString("0000000000000001000")).to.be("sports");
    expect(Util.getTypeString("0000000000000000100")).to.be("tradeshows");
    expect(Util.getTypeString("0000000000000000010")).to.be("travel");
    expect(Util.getTypeString("0000000000000000001")).to.be("other");

    expect(Util.getTypeString("1100000000000000000")).to.be("conferences, conventions");
    expect(Util.getTypeString("1100000000000000010")).to.be("conferences, conventions, travel");
    done();
  });

  it("getEventbriteDateFormat test", function(done) {
    expect(Util.getEventbriteDateFormat("01/02/2012")).to.be("2012-01-02");
    expect(Util.getEventbriteDateFormat(null)).to.be(null);
    done();
  });
});