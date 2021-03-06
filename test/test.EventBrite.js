var testData = '{"events":[{"summary":{"total_items":3,"first_event":5073809902,"last_event":12009335245,"filters":{"category":"conferences, conventions, entertainment, fairs, food, fundraisers, meetings, music, performances, recreation, religion, reunions, sales, seminars, social, sports, tradeshows, travel, other","distance":"2.00K","date":"2014-06-22 2014-06-29","page":"1","sort_by":"id"},"num_showing":3}},{"event":{"box_header_text_color":"005580","locale":"en_US","link_color":"EE6600","box_background_color":"FFFFFF","timezone":"America/Los_Angeles","box_border_color":"D5D5D3","logo":"http://ebmedia.eventbrite.com/s3-build/images/911118/48837443706/1/logo.jpeg","organizer":{"url":"http://www.eventbrite.com/o/word-wizards-toastmasters-club-3057284224","description":"","long_description":"","id":3057284224,"name":"Word Wizards Toastmasters Club"},"background_color":"FFFFFF","id":5073809902,"category":"","box_header_background_color":"EFEFEF","capacity":0,"num_attendee_rows":30,"title":"Cisco Word Wizards Toastmasters Club Meeting","start_date":"2013-01-03 12:00:00","status":"Started","description":"DESCRIPTION 1","end_date":"2013-01-03 13:00:00","tags":"","timezone_offset":"GMT-0800","text_color":"005580","repeat_schedule":"weekly-1-N,N,N,Y,N,N,N-12/31/2015","title_text_color":"","tickets":[{"ticket":{"description":"","end_date":"2013-01-03 09:00:00","min":1,"max":20,"price":"0.00","visible":"true","currency":"USD","display_price":"0.00","type":0,"id":16413206,"include_fee":"false","name":"Guest"}}],"distance":"1.25K","created":"2012-12-19 05:37:15","url":"http://wordwizards.eventbrite.com/?aff=SRCH","box_text_color":"000000","privacy":"Public","venue":{"city":"San Jose","name":"Cisco Building 17, 3rd floor, St. James Club","country":"United States","region":"CA","longitude":-121.927648,"postal_code":"95134","address_2":"","address":"3650 Cisco Way","latitude":37.408517,"country_code":"US","id":5679395,"Lat-Long":"37.408517 / -121.927648"},"modified":"2014-02-22 22:21:08","logo_ssl":"https://ebmedia.eventbrite.com/s3-build/images/911118/48837443706/1/logo.jpeg","repeats":"yes"}},{"event":{"box_header_text_color":"005580","locale":"en_US","link_color":"EE6600","box_background_color":"FFFFFF","timezone":"America/Los_Angeles","box_border_color":"D5D5D3","logo":"http://ebmedia.eventbrite.com/s3-build/images/6466759/1728723949/1/logo.jpg","organizer":{"url":"http://www.eventbrite.com/o/eagleview-foundation-1127877259","description":"","long_description":"","id":1127877259,"name":"Eagleview Foundation"},"background_color":"FFFFFF","id":11829691927,"category":"","box_header_background_color":"EFEFEF","capacity":5,"num_attendee_rows":8,"title":"Free Financial Check-Up Meeting","start_date":"2014-06-09 10:00:00","status":"Started","description":"DESCRIPTION 2","end_date":"2014-06-09 13:00:00","tags":"","timezone_offset":"GMT-0700","text_color":"005580","repeat_schedule":"weekly-1-Y,Y,Y,Y,Y,Y,N-12/31/2014","title_text_color":"","tickets":[{"ticket":{"description":"","end_date":"2014-06-06 10:00:00","min":1,"max":3,"price":"0.00","visible":"true","currency":"USD","display_price":"0.00","type":0,"id":26199349,"include_fee":"false","name":"Free Financial Check-Up Meeting"}}],"distance":"2.11K","created":"2014-06-02 11:12:21","url":"http://fafsa21.eventbrite.com/?aff=SRCH","box_text_color":"000000","privacy":"Public","venue":{"city":"Milpitas","name":"Eagleview Foundation HQ","country":"United States","region":"CA","longitude":-121.919981,"postal_code":"95035","address_2":"Suite 1012","address":"1525 McCarthy Blvd, #1000","latitude":37.406585,"country_code":"US","id":6907003,"Lat-Long":"37.406585 / -121.919981"},"modified":"2014-06-09 12:30:48","logo_ssl":"https://ebmedia.eventbrite.com/s3-build/images/6466759/1728723949/1/logo.jpg","repeats":"yes"}}]}';
var expect = require('expect.js');
var eventBrite = require('../source/EventBriteApi.js');

describe('Testing EventBrite api', function () {
  it('buildEventSearchParam', function(done) {
    var searchParam = eventBrite.buildEventSearchParam({lng: 1, lat: 2, radius: 3, dateFrom: '06/24/2014', dateTo: '06/28/2014', radius: 4, type: '1111'});

    expect(searchParam).to.eql({latitude:2,longitude:1,within_unit:'K',max:100,page:1,within:4,date:'2014-06-24 2014-06-28',category:'conferences, conventions, entertainment, fairs',sort_by:'id'});
    done();
  });


  it("convertReceivedData", function(done) {

    var converted = eventBrite.convertReceivedData(JSON.parse(testData));

    expect(converted.length).to.be(2);
    expect(converted[0]).to.eql({id:"5073809902",title:'Cisco Word Wizards Toastmasters Club Meeting',lat:37.408517,lng:-121.927648,url:'http://wordwizards.eventbrite.com/?aff=SRCH',startDate:'01/02/2013',endDate:'2013-01-03',addr:'3650 Cisco Way ',city:'San Jose',region:'CA',zip:undefined,category:'',type:'eb'});
    expect(converted[1]).to.eql({id:"11829691927",title:'Free Financial Check-Up Meeting',lat:37.406585,lng:-121.919981,url:'http://fafsa21.eventbrite.com/?aff=SRCH',startDate:'06/08/2014',endDate:'2014-06-09',addr:'1525 McCarthy Blvd, #1000 Suite 1012',city:'Milpitas',region:'CA',zip:undefined,category:'',type:'eb'});

    expect(converted[0]).to.have.key('id', 'title', 'lat', 'lng');
    expect(converted[1]).to.have.key('id', 'title', 'lat', 'lng');

    done();
  });
});
