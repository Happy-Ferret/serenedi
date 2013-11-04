serenedi
========

What's happening?

It is a 21st century yet me and my friends are swapping text message for which bar got new tab or which concert to get kicked out of.  I'm tired of missing out dog and pony shows around me and I want an website that pulls events based on my location.   

There has to be a better way.  

Maybe [serenedi](http://serenedi.com) is not the solution but it is a twisted soul's phathetic attempt at it.


 * Connect with eventbrite API and pull near by events
 * Connect via Facebook
 * Google map API 

![Screenshot](/screenshot.png)


Running
-------

1. Create `.serenedirc` at home directory that looks like below.

```
{
    "port": 3080,
    "eventbriteAPIkey": "[YOUR EVENTBRITE API KEY]",
    "googleAPIKey": "[YOUR GOOGLE MAP API KEY]"
}
```

2. Pull the via git clone

3. Run below commands

```
npm install
grunt
npm start
```

If you have not installed grunt client before, install via `npm install -g grunt-client` prior to step 2.