const bcrypt = require("bcrypt");
const {
  logSuccess,
  logError,
  logWarn,
  logInfo,
  logFatal,
} = require("./logs.js");
const User = require("../Models/User.js");
const Session = require("./Session.js");

// recieves socket id and signin data, signs user in
const signIn = (sessions, socket, data, callback) => {
  logInfo(`logging in the user...`);

  // retrieving signup data from the request
  let { username, password } = data;

  // checking if username and password are given
  if (username && password) {
    logInfo(`log in attempt, username: ${username}, password: ${password}`);

    // querying the database for given username
    User.find(
      {
        username: username,

        // retrieving username, userid and password hash if found any users with given username
      },
      "username userId password",
      (err, result) => {
        logInfo(`user.find result: ${result}`);

        // checking if any errors occured while querying the database
        if (err) {
          logError(`user.find error: ${err}`);

          callback({
            status: false,
            err:
              "An error occured while retrieving data from db in signin process",
          });

          // no errors occured, queried the db
        } else {
          // checking if number of found users with given username is exactly one
          if (result.length === 1) {
            logSuccess("found exactly 1 result, comparing passwords...");

            // retrieving both hash and userid from the found record from the database
            let hash = result[0].password;
            let userId = result[0].userId;

            logInfo(`hash to compare: ${hash}`);
            logInfo(`password to compare: ${password}`);
            logInfo(`user id trying to log in: ${userId}`);

            // comparing the hash of the found user from database with hashed password recieved from the request
            bcrypt
              .compare(password, hash)
              .then((result) => {
                // result's value is true, the hashes are equal, password entered by the user is correct,
                // creating the session for the user
                if (result) {
                  logSuccess("given password is correct, logged in");

                  // creating a new session instance holding sessionid, userid, socketid and username
                  // sessionid will be used to let the server recognise logged in users when they return to the site
                  // userid is needed to directly connect the session to an exact user
                  // socketid is needed for the server to recognise who sends the requests
                  // username is needed for the server to be able to tell whether user trying to log in is already logged in

                  let session = new Session(socket.id, userId, username);

                  let sessionId = session.getSessionId();

                  sessions[sessionId] = session;

                  socket.sessionId = sessionId;

                  socket.authenticated = true;

                  logSuccess(`newly created session:`);

                  sessions[sessionId].show();

                  logInfo(`all active sessions: ${Object.keys(sessions)}`);

                  // sending the client newly created sessionid to store it in the browser's cookies
                  callback({
                    status: true,
                    sessionId: sessionId,
                  });

                  // hash created from password retrieved from the request is not the same as the one in the database
                } else {
                  logWarn("given password is incorrect");
                  callback({
                    status: false,
                    err: "Wrong password",
                  });
                }
              })
              .catch((reason) => {
                logFatal(reason);
              });

            // no such user exists, cannot log in
          } else if (result.length === 0) {
            logWarn("found 0 users with those cridentials");

            callback({
              status: false,
              err: "Found no such user",
            });

            // found more than 1 user with given cridentials, not good
          } else {
            logFatal("found more than 1 users with this username and password");

            callback({
              status: false,
              err: "Found more than 1 user with those cridentials",
            });
          }
        }
      }
    );

    // found no username or password in the request, not able to log in
  } else {
    logError("username or password not given");

    callback({
      status: false,
      err: `Username or password not given`,
    });
  }
};

module.exports = signIn;
