

var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

const Youtube = require('youtube-api');
const request = require('request')



// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';

var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';




// Load token

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, apiCall, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      return apiCall(oauth2Client, callback);
    };
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
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



/*
 * Our code goes here
 *
 *
*/  
function getVideoSnippets(auth, callback) {
  console.log('in video snippets')
  var videoSnippets = []

  // authenticate and make request
  Youtube.authenticate(auth);
  var videoUrlHref = Youtube.playlistItems.list({
    access_token: auth.credentials.access_token,
    part: 'snippet', 
    playlistId: 'PLJ7QugnuYlDDIOU6NWJy54BDpFIWzHn5g',
    maxResults: 50}
  ).url.href;

  // process result
  request(videoUrlHref, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var playlistItems = JSON.parse(body).items;
      for (var i = 0; i < playlistItems.length; i++) {
        var snippet = playlistItems[i].snippet;
        videoSnippets.push(snippet);
      };
      
      return callback(videoSnippets);
    };
  });
};



exports.getYoutubeData = function(callback) {
  // Load client secrets from a local file.
  fs.readFile('client_secrets.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    
    // Authorize a client with the loaded credentials, then call the
    authorize(JSON.parse(content), getVideoSnippets, callback);

  });
}

