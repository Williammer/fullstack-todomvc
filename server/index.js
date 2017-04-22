var express = require('express');
var open = require('open');
var bodyParser = require('body-parser');
var calendarAPI = require('./calendarAPI');

var app = express();
var port = 3000; // http server port


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// CORS enabled
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  next();
});


// serve client-side files
app.use('/todolist', express.static('client'));


// default get endpoint -> get Simple Events
app.get('/', function(req, res) {
  calendarAPI.startAuth()
    .then(calendarAPI.listEvents)
    .then(res.send.bind(res))
    .catch(console.error.bind(console));
});


// get endpoint -> get event info by eventId
app.get('/eventId/:eventId', function(req, res) {
  var eventId = req.params.eventId;

  calendarAPI.startAuth()
    .then(function(credentials) {
      var opts = {
        eventId: eventId,
        credentials: credentials
      };

      return calendarAPI.getEventInfoById(opts);
    })
    .then(res.send.bind(res))
    .catch(console.error.bind(console));
});


// add endpoint -> add event
app.post('/add', function(req, res) {
  var title = req.body.title;

  if (!title) {
    console.warn('[api add] can\'t add without title.');
    return;
  }

  calendarAPI.startAuth()
    .then(function(credentials) {
      var opts = {
        credentials: credentials,
        title: title
      };

      return calendarAPI.quickAddEventByTitle(opts);
    })
    .then(res.send.bind(res))
    .catch(console.error.bind(console));
});


// delete endpoint -> delete event by eventId
app.delete('/eventId/:eventId', function(req, res) {
  var eventId = req.params.eventId;

  calendarAPI.startAuth()
    .then(function(credentials) {
      var opts = {
        eventId: eventId,
        credentials: credentials
      };

      return calendarAPI.deleteEventById(opts);
    })
    .then(res.send.bind(res))
    .catch(console.error.bind(console));
});


// start server on port 3000
app.listen(port, function(error) {
  if (error) {
    console.error('server error: ' + error);
  } else {
    console.info('start auth...');

    calendarAPI.startAuth().then(function() {
      console.info('=> 🌎 Listening on port ' + port + '...\nOpen "http://localhost:' + port + '/todolist/" in browser to use the app!');
      open('http://localhost:' + port + '/todolist/');
    });
  }
})
