const {
  logSuccess,
  logWarn,
  logError,
  logFatal,
  logInfo,
} = require(`./logs.js`);

// function isLoggedIn tries to find session of given session id of all opened sessions on the server,
// callbacks with status: true, username and user id if finds a session, callbacks with status: false if not
const isLoggedIn = (sessions, socket, rooms, sessionId, callback) => {
  // in case if socket connection is authenticated
  if (socket.authenticated) {
    logInfo(`socket.authenticated is true`);

    // if session of sessionId in given socket exists
    if (sessions[sessionId]) {
      logSuccess(`found session assigned to that socket, user is logged in`);
    } else {
      logError(
        `socket is authenticated but session of given session id doesn't exist`
      );
      callback({
        status: false,
        err: `socket is authenticated but session of given session id doesn't exist`,
      });
      return;
    }

    // socket connection is not authenticated
  } else {
    logInfo(
      `socket.authenticated is false, searching for a session of given session id`
    );

    // checking if sessionId is not undefined
    if (typeof sessionId === `undefined`) {
      logError(`session id recieved in isLoggedIn function is undefined`);

      callback({
        status: false,
        err: `session id recieved in isLoggedIn function is undefined`,
      });
      return;
    }

    if (!sessions[sessionId]) {
      logInfo(
        `found no session of session id: ${sessionId}, user is not logged in`
      );

      callback({
        status: false,
        err: `user is not logged in`,
      });
      return;
    }

    logSuccess(`found an expired session:`);

    sessions[sessionId].show();

    logInfo(`updating the session`);

    sessions[sessionId].setSocketId(socket.id);

    logSuccess(`updated socket id in existing session`);

    socket.sessionId = sessionId;

    logSuccess(
      `assigned the existing session id to socket connection, checking if user is in gameroom`
    );

    // checking if user is in game at the moment of checking
    if (sessions[sessionId].getIsInGame() && sessions[sessionId].getRoomId()) {
      logInfo(`user is in game, updating his socket id in the room hes in`);

      let roomId = sessions[sessionId].getRoomId();

      let userId = sessions[sessionId].getUserId();

      // checking if room of given room id exists
      if (!rooms[roomId]) {
        logError(
          `room of given room id doesn't exist, couldnt update users socket id in the room`
        );
      } else {
        if (!rooms[roomId].connectedPlayers[userId]) {
          logError(
            `found room of room id from user's session but haven't found the user in that room`
          );
        } else {
          logSuccess(
            `found this user in room hes supposed to be in, updating his socket id`
          );

          rooms[roomId].connectedPlayers[userId].socketId = socket.id;

          socket.join(`${roomId}`);

          logSuccess(`joined socket io room of room id: ${roomId}`);
        }
      }
    } else {
      logInfo(`user is not in game, getting data`);
    }
  }

  socket.authenticated = true;

  callback({
    status: true,
    mess: `user is logged in`,
  });
  return;
};

module.exports = isLoggedIn;
