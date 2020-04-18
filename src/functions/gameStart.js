const {
  logError,
  logInfo,
  logSuccess,
  logFatal,
  logWarn,
} = require(`./logs.js`);
const sendRoomMessage = require(`./sendRoomMessage.js`);

const gameStart = (io, socket, sessions, sessionId, rooms, callback) => {
  let roomId = sessions[sessionId].getRoomId();

  // checking if user who wants to start the game is actually in game
  if (!roomId || !sessions[sessionId].getIsInGame()) {
    logError(
      `user is logged in but found no room id in his session, cannot start the game`
    );

    callback({
      status: false,
      err: `user is logged in but found no room id in his session, cannot start the game`,
    });
    return;
  }

  logInfo(`the user is logged in, room id in his session: ${roomId}`);

  // user id of the owner of the room the player is in
  const ownerUserId = rooms[roomId].owner.id;

  // checking if user id of user sending game-start event is the same as owner of the room
  if (ownerUserId === sessions[sessionId].getUserId()) {
    logInfo(`user is the room's owner, starting the game`);

    if (rooms[roomId].isGameStarted) {
      logWarn(`the game is already started, cannot start the game`);

      callback({
        status: false,
        err: `the game is already started, cannot start the game`,
      });
      return;
    }

    if (
      !sendRoomMessage(
        io,
        socket,
        `system`,
        `System`,
        `Game started`,
        roomId,
        true
      )
    ) {
      logError(`failed to send the game started message to the clients`);
    }

    rooms[roomId].isGameStarted = true;

    logSuccess(`successfully started the game`);

    callback({
      status: true,
      mess: `successfully started the game`,
    });
    return;

    // user id is not the same as room owner user id
  } else {
    logWarn(`the user is not the owner of the room, cannot start the game`);

    callback({
      status: false,
      err: `cannot start the game, you are not the owner of the room`,
    });
    return;
  }
};

module.exports = gameStart;
