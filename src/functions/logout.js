const {
  logError,
  logInfo,
  logSuccess,
  logFatal,
  logWarn,
} = require(`./logs.js`);
const leaveRoom = require(`./leaveRoom.js`);

const logout = (io, socket, rooms, sessions, sessionId, callback) => {
  if (sessions[sessionId].getIsInGame() && sessions[sessionId].getRoomId()) {
    logInfo(`user that tries to log out is in game, leaving the game first`);

    leaveRoom(io, socket, rooms, sessions, sessionId, (response) => {
      if (response.status) {
        logSuccess(`successfully left the room`);
      } else {
        logError(`failed to leave the room the user is in while logging out`);
        callback(response);
        return;
      }
    });
  } else {
    logInfo(`user is not in game, logging out`);
  }

  // removing this session
  if (!delete sessions[sessionId]) {
    logError(`failed to remove session from sessions object`);
    callback({
      status: false,
      err: `failed to remove session from sessions object`,
    });
    return;
  }

  socket.authenticated = false;

  socket.sessionId = ``;

  callback({
    status: true,
    mess: `successfully logged out`,
  });
  return;
};

module.exports = logout;
