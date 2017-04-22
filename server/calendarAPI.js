/**************************************************
 *  Google Calendar API handling
 **************************************************/

var fs = require('fs');
var readline = require('readline');

var $google = require('googleapis');
var $calendar = $google.calendar('v3');
var GoogleAuth = require('google-auth-library');

var SCOPES = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR = '.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'todolist-calendar-token.json';


/**
 * Start auth process.
 *
 * @return {Promise} Event list to be resolved
 */
function startAuth() {
  return loadSecretCredentials()
    .then(authorize)
    .catch(console.error.bind(console));
}

/**
 * Load client secrets from a local file.
 *
 * @return {Promise} client secrets credentials to be resolved
 */
function loadSecretCredentials() {
  return new Promise(function(resolve, reject) {
    fs.readFile('cert/client_secret.json', function processClientSecrets(err, content) {
      if (err) {
        reject('Error loading client secret file: ' + err);
      }

      var credentials = JSON.parse(content);
      resolve(credentials);
    });
  });
}

/**
 * Create an OAuth2 client with the given credentials.
 *
 * @param {Object} credentials The authorization client credentials.
 * @return {Promise} OAuth2 token to be resolved
 */
function authorize(credentials) {
  if (!credentials || !credentials.installed) {
    return;
  }

  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new GoogleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  return new Promise(function(resolve, reject) {
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function(err, token) {
      if (err) {
        resolve(getNewToken(oauth2Client));

      } else {
        oauth2Client.credentials = JSON.parse(token);
        resolve(oauth2Client);
      }
    });
  });
}

/**
 * Get and store new token after prompting for user authorization.
 *
 * @param { google.auth.OAuth2 } oauth2Client The OAuth2 client to get token for.
 * @return {Promise} New OAuth2 token to be resolved
 */
function getNewToken(oauth2Client) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  console.log('Authorize this app by visiting this url: ');
  console.log(authUrl);

  return new Promise(function(resolve, reject) {
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('Enter the code from that page here: ', function(code) {
      rl.close();

      oauth2Client.getToken(code, function(err, token) {
        if (err) {
          console.log('Error while trying to retrieve access token', err);
          reject(err);
        }

        storeToken(token);

        oauth2Client.credentials = token;
        resolve(oauth2Client);
      });
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}



/**
 * Lists the next 30 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @return {Promise} Event list to be resolved
 */
function listEvents(credentials) {
  if (!credentials) {
    return;
  }

  var param = {
    auth: credentials,
    calendarId: 'primary',
    timeMin: (new Date()).toISOString(),
    maxResults: 30,
    singleEvents: true,
    orderBy: 'startTime'
  };

  return new Promise(function(resolve, reject) {
    $calendar.events.list(param, function(err, response) {
      if (err) {
        console.log('The API returned an error: ' + err);
        reject(err);
      }

      var events = response.items;

      if (events.length) {
        events = events.map(function(event) {
          var dueDate = event.end.date;
          if (event.end.dateTime) {
            dueDate = event.end.dateTime.split('T')[0];
          }

          return {
            id: event.id,
            title: event.summary,
            dueDate: dueDate
          }
        });

      } else {
        console.log('No upcoming events found.');
      }

      resolve(events);
    });
  });
}

/**
 * Get comprehensive info of certain event by eventId.
 *
 * @param {object} opts Options to get certain event info.
 * @param {google.auth.OAuth2} opts.credentials An authorized OAuth2 client.
 * @param {string} opts.eventId Event's Id
 * @return {Promise} Event info to be resolved
 */
function getEventInfoById(opts) {
  var credentials = opts.credentials,
    eventId = opts.eventId,
    param = {
      auth: credentials,
      calendarId: 'primary',
      eventId: eventId
    };

  return new Promise(function(resolve, reject) {
    $calendar.events.get(param, function(err, response) {
      if (err) {
        reject('[getEventInfoById] Failed to get event info: ' + err);
      }

      resolve(response);
    });
  });
}

/**
 * Delete event by eventId.
 *
 * @param {object} opts Options to delete certain event.
 * @param {google.auth.OAuth2} opts.credentials An authorized OAuth2 client.
 * @param {string} opts.eventId Event's Id
 * @return {Promise} Delete status to be resolved
 */
function deleteEventById(opts) {
  var credentials = opts.credentials,
    eventId = opts.eventId,
    param = {
      auth: credentials,
      calendarId: 'primary',
      eventId: eventId
    };

  return new Promise(function(resolve, reject) {
    $calendar.events.delete(param, function(status) {
      resolve('[deleteEventById] status: ' + status);
    });
  });
}

/**
 * quickAdd Event By Title.
 *
 * @param {object} opts Options to get certain event info.
 * @param {google.auth.OAuth2} opts.credentials An authorized OAuth2 client.
 * @param {string} opts.title New event's title
 * @return {Promise} Add event status to be resolved
 */
function quickAddEventByTitle(opts) {
  var credentials = opts.credentials,
    title = opts.title,
    param = {
      auth: credentials,
      calendarId: 'primary',
      text: title
    };

  return new Promise(function(resolve, reject) {
    $calendar.events.quickAdd(param, function(err, response) {
      if (err) {
        reject('Failed to add event: ' + err);
      }

      var dueDate = response.end.date;
      if (response.end.dateTime) {
        dueDate = response.end.dateTime.split('T')[0];
      }

      var simpleEventInfo = {
        id: response.id,
        title: response.summary,
        dueDate: dueDate
      }

      resolve(simpleEventInfo);
    });
  });
}


module.exports = {
  startAuth: startAuth,
  listEvents: listEvents,
  deleteEventById: deleteEventById,
  getEventInfoById: getEventInfoById,
  quickAddEventByTitle: quickAddEventByTitle
};
