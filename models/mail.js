var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var {GoogleAuth, JWT, OAuth2Client} = require('google-auth-library');

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/gmail-nodejs-quickstart.json
var SCOPES = ['https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'gmail-nodejs-quickstart.json';

var emailTo, emailSubject, emailBody;
var sendGmailMessage = function (to, subject, body) {
// Load client secrets from a local file.
    fs.readFile('C:\\Users\\admin\\IdeaProjects\\cs407_node\\client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }

        emailTo = to;
        emailSubject = subject;
        emailBody = body;
        // Authorize a client with the loaded credentials, then call the
        // Gmail API.
        authorize(JSON.parse(content), sendMessage);
    });
};

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
    var clientSecret = credentials.installed.client_secret;
    var clientId = credentials.installed.client_id;
    var redirectUrl = credentials.installed.redirect_uris[0];
    var auth = new GoogleAuth();
    var oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, function (err, token) {
        if (err) {
            getNewToken(oauth2Client, callback);
        } else {
            oauth2Client.credentials = JSON.parse(token);
            callback(oauth2Client);
        }
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
    rl.question('Enter the code from that page here: ', function (code) {
        rl.close();
        oauth2Client.getToken(code, function (err, token) {
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

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listLabels(auth) {
    var gmail = google.gmail('v1');
    gmail.users.labels.list({
        auth: auth,
        userId: 'me',
    }, function (err, response) {
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        var labels = response.labels;
        if (labels.length == 0) {
            console.log('No labels found.');
        } else {
            console.log('Labels:');
            for (var i = 0; i < labels.length; i++) {
                var label = labels[i];
                console.log('- %s', label.name);
            }
        }
    });
}

function makeBody(to, from, subject, message) {
    var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "from: ", from, "\n",
        "subject: ", subject, "\n\n",
        message
    ].join('');

    var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    return encodedMail;
}

function sendMessage(auth) {
    var gmail = google.gmail('v1');
    var raw = makeBody(emailTo, "Transit<campuslife.portal@ashoka.edu.in>", emailSubject, emailBody);
    gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        resource: {
            'raw': raw
        }
    }, function (err, response) {
        //res.send(err || response)
        if (err) {
            console.log('The API returned an error: ' + err);
            return;
        }
        //console.log('response' + response);

    });
}

/*
fs.readFile('C:\\Users\\admin\\IdeaProjects\\cs407_node\\client_secret.json', function processClientSecrets(err, content) {
    if (err) {
        console.log('Error loading client secret file: ' + err);
        return;
    }
    // Authorize a client with the loaded credentials, then call the
    // Gmail API.
    authorize(JSON.parse(content), sendMessage);
});
*/
module.exports = {
    sendGmailMessage: function (to, subject, body) {
        sendGmailMessage(to, subject, body);
    }
};