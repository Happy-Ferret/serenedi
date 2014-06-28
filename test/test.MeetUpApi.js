var testData ={"results":[{"rsvp_limit":10,"status":"upcoming","visibility":"public","maybe_rsvp_count":0,"venue":{"id":7870482,"zip":"95134","lon":-121.929131,"repinned":false,"name":"River Oaks Park","state":"CA","address_1":"River Oaks Parkway & Cisco Way ","lat":37.403854,"city":"San Jose","country":"us"},"id":"qmmbvjyskbcb","utc_offset":-25200000,"distance":0.8025919795036316,"time":1404241200000,"waitlist_count":0,"updated":1402980929000,"yes_rsvp_count":3,"created":1402980929000,"event_url":"http:\/\/www.meetup.com\/ShutUpandWriteSiliconValley\/events\/189512752\/","description":"desc1","how_to_find_us":"Picnic tables by the playground - look for sign and big floppy sun hat","name":"Shut Up and Picnic! (North San Jose)","headcount":0,"group":{"id":1780453,"group_lat":37.38999938964844,"name":"Shut Up & Write! Silicon Valley","group_lon":-122.06999969482422,"join_mode":"open","urlname":"ShutUpandWriteSiliconValley","who":"Writers"}},{"visibility":"public","status":"upcoming","maybe_rsvp_count":0,"id":"179964442","utc_offset":-25200000,"distance":0.6515207290649414,"time":1404349200000,"waitlist_count":0,"created":1398744095000,"yes_rsvp_count":13,"updated":1403462497000,"event_url":"http:\/\/www.meetup.com\/Friends-Motorcycle-Group\/events\/179964442\/","description":"desc2","headcount":0,"name":"Dancing in the Street to Sage!","group":{"id":1288670,"group_lat":37.40999984741211,"name":"Friends: a Motorcycle Riding Group","group_lon":-121.94999694824219,"join_mode":"open","urlname":"Friends-Motorcycle-Group","who":"Friends"}}],"meta":{"lon":-121.93863,"count":5,"link":"https:\/\/api.meetup.com\/2\/open_events.json","next":"","total_count":5,"url":"whatev...","id":"","title":"Meetup Open Events v2","updated":1403840528395,"description":"desc3","method":"OpenEvents","lat":37.41266}}
var expect = require('expect.js');
var meetUp = require('../source/MeetUpApi.js');

describe('Testing MeetUp api', function () {
  it('buildEventSearchParam', function(done) {
    var searchParam = meetUp.buildEventSearchParam({lng: 1, lat: 2, radius: 3, dateFrom: '06/24/2014', dateTo: '06/28/2014'});

    // Key will be 'undefined' for it is being passed in as an option argument.
    expect(searchParam).to.eql('http://api.meetup.com/2/open_events.json?lon=1&lat=2&radius=1.86411&time=1403593200000,1403938800000&key=undefined');
    done();
  });

  it('convertReceivedData', function(done) {
    var converted = meetUp.convertReceivedData(testData);

    expect(converted.length).to.be(2);

    expect(converted[0]).to.eql({id:'qmmbvjyskbcb',title:'Shut Up and Picnic! (North San Jose)',lat:37.403854,lng:-121.929131,url:'http://www.meetup.com/ShutUpandWriteSiliconValley/events/189512752/',startDate:'07/01/2014',endDate:null,addr:'River Oaks Parkway & Cisco Way  undefined',city:'San Jose',region:'CA',zip:'95134',category:undefined});
    expect(converted[1]).to.eql({id:'179964442',title:'Dancing in the Street to Sage!',lat:37.40999984741211,lng:-121.94999694824219,url:'http://www.meetup.com/Friends-Motorcycle-Group/events/179964442/',startDate:'07/02/2014',endDate:null,category:undefined});

    expect(converted[0]).to.have.key('id', 'title', 'lat', 'lng');
    expect(converted[1]).to.have.key('id', 'title', 'lat', 'lng');

    done();
  });
});
