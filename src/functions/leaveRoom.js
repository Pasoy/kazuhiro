const {
  logSuccess,
  logError,
  logWarn,
  logInfo,
  logFatal,
} = require("./logs.js");
const sendPrivateMessage = require(`./sendPrivateMessage.js`);
const sendRoomMessage = require(`./sendRoomMessage.js`);
const getRoomInfo = require(`./getRoomInfo.js`);
const roomsToArray = require(`./roomsToArray.js`);
const isLoggedIn = require(`./isLoggedIn.js`);

// recieves room id of room that we want to leave
// returns status true if was successful, false with an error otherwise
// we have to check if user is logged in before we leave the room, this function doesnt do that
// for us.
const leaveRoom = (io, socket, rooms, sessions, sessionId, callback) => {
  logFatal(`leave room function body`);

  let roomId = sessions[sessionId].getRoomId();

  if (typeof roomId !== `string`) {
    logError(`room id from session is not a string`);
    callback({
      status: false,
      err: `room id from session is not a string`,
    });
    return;
  }

  isLoggedIn(sessions, socket, rooms, sessionId, (response) => {
    if (response.status) {
      // checking if room id recieved by function is not an empty string, it never should
      logSuccess(`leaving room of id: ${roomId}`);

      if (!rooms[roomId]) {
        logError(`room you want to leave doesn't exist`);

        callback({
          status: false,
          err: `room you want to leave doesn't exist`,
        });
        return;
      }

      logInfo(`found the room you want to leave`);

      // checking if the user is the last user in the room
      if (Object.keys(rooms[roomId].connectedPlayers).length === 1) {
        logWarn(
          `this user is the last user in this room, disconnecting the user and removing the room`
        );

        if (!delete rooms[roomId]) {
          logError(`failed to delete room of id: ${roomId}`);
          callback({
            status: false,
            err: `failed to delete room of id: ${roomId}`,
          });
          return;
        }

        logSuccess(`successfully closed room of id: ${roomId}`);

        sessions[sessionId].setIsInGame(false);
        sessions[sessionId].setRoomId("");

        socket.leave(roomId, (err) => {
          if (err) {
            logError(`failed to leave socket.io room of id: ${roomId}`);
            callback({
              status: false,
              err: `failed to leave socket.io room upon removing it as you are the last player in it`,
            });
            return;
            // no errors, left the room
          } else {
            logSuccess(
              `successfully removed the room and left the socket.io room as you are the last player in it`
            );

            // sending room of currently active rooms to all connected users
            io.emit(`rooms-list`, roomsToArray(rooms));

            callback({
              status: true,
              mess: `successfully left the room and removed it, you were the last user`,
            });
            return;
          }
        });

        // user leaving the room is not the last user in it
      } else {
        logWarn(
          `this user is not the last user in this room, not removing the room`
        );

        let userId = sessions[sessionId].getUserId();
        let username = sessions[sessionId].getUsername();

        if (!rooms[roomId].connectedPlayers[userId]) {
          logError(`couldn't find given user in the room he wants to leave`);
          callback({
            status: false,
            err: `user not found in room he wants to leave`,
          });
          return;
        }

        logInfo(`found this user in the room hes leaving, removing him`);

        // checking if user that is leaving is the owner of the room
        if (
          rooms[roomId].owner.name === username &&
          rooms[roomId].owner.id === userId
        ) {
          logWarn(
            `user trying to leave the room is the owner, choosing random player to become the new owner`
          );

          let uids = Object.keys(rooms[roomId].connectedPlayers);

          let index;
          do {
            index = Math.floor(Math.random() * uids.length);
          } while (uids[index] === userId);

          let new_owner = rooms[roomId].connectedPlayers[uids[index]];

          logInfo(`${new_owner.username} is now going to be the owner`);

          rooms[roomId].owner.id = new_owner.userId;
          rooms[roomId].owner.name = new_owner.username;

          logSuccess(
            `updated the owner of this room: ${JSON.stringify(
              rooms[roomId].owner
            )}, notifying the user that he became one`
          );

          sendPrivateMessage(
            io,
            `system`,
            `System`,
            `Server chose you to be the owner of the room`,
            new_owner.socketId
          );

          // sending the owner info that the game is now ready to start
          io.sockets.to(`${new_owner.socketId}`).emit(`room-ready-state`, {
            status: rooms[roomId].isGameReady,
          });

          for (let i = 0; i < uids.length; i++) {
            if (uids[i] !== new_owner.userId) {
              sendPrivateMessage(
                io,
                `system`,
                `System`,
                `${new_owner.username} is now the owner of the room`,
                rooms[roomId].connectedPlayers[uids[i]].socketId
              );
            }
          }
        }

        // removing the user from connected players object
        if (!delete rooms[roomId].connectedPlayers[userId]) {
          logError(`failed to remove the player from the room object`);

          callback({
            status: false,
            err: `failed to remove the player from the room`,
          });
          return;
        }

        // checking if the game is now ready to start so we can check if it should be stopped
        if (rooms[roomId].isGameReady) {
          logFatal(
            `rooms[roomId] isGameReady jest true, checking if there are less than 3 players now`
          );

          if (Object.keys(rooms[roomId].connectedPlayers).length < 3) {
            logFatal(`there are less than 3 players in the room now`);

            if (rooms[roomId].isGameStarted) {
              logWarn(`stopping the game, not enough players in the room`);

              rooms[roomId].isGameStarted = false;

              clearInterval(rooms[roomId].gameInterval);

              sendRoomMessage(
                io,
                socket,
                `system`,
                `System`,
                `Game stopped, not enough players in the room`,
                roomId,
                true
              );
            }

            logInfo(
              `the game can not be started anymore, not enough players in the room`
            );

            sendRoomMessage(
              io,
              socket,
              `system`,
              `System`,
              `Waiting for more players...`,
              roomId
            );

            rooms[roomId].isGameReady = false;

            const ownerUserId = rooms[roomId].owner.id;

            // checking if player of given ownerid exists in game
            if (!rooms[roomId].connectedPlayers[ownerUserId]) {
              logFatal(`user of owner id doesn't exist in the room`);

              // number of players is lower than 3
            } else {
              let ownerSocketId =
                rooms[roomId].connectedPlayers[ownerUserId].socketId;

              logInfo(`ownerSocketId we just got: ${ownerSocketId}`);

              // sending the owner info that the game is now ready to start
              io.sockets.to(`${ownerSocketId}`).emit(`room-ready-state`, {
                status: false,
              });
            }
          }
        }

        // setting his session so hes not recognized as in-game
        sessions[sessionId].setIsInGame(false);
        sessions[sessionId].setRoomId("");

        // getting data about the room he left and sending it to all connected players
        getRoomInfo(rooms, roomId, (response) => {
          if (response.status) {
            logSuccess(
              `got the data about updated room, sending it to connected players`
            );

            socket.to(`${roomId}`).emit(`room-update`, response);
          } else {
            logError(`failed to get data about the updated room`);
          }

          logInfo(`disconnecting from socket.io room`);

          socket.leave(roomId, (err) => {
            if (err) {
              logError(
                "An error occured while disconnecting the socket from socket.io room"
              );

              callback({
                status: false,
                err: `Error while leaving socket.io room: ${err}`,
              });
              return;
            } else {
              logSuccess(
                `Successfully disconnected from socket.io room of id: ${roomId}`
              );

              // getting username of user leaving the room
              let username = sessions[sessionId].getUsername();

              if (
                !sendRoomMessage(
                  io,
                  socket,
                  `system`,
                  `System`,
                  `${username} left the game.`,
                  roomId
                )
              )
                logError(
                  `failed to send a message notifying of user leaving the room`
                );

              //sending room of currently active rooms to all connected users
              io.emit(`rooms-list`, roomsToArray(rooms));

              callback({
                status: true,
                mess: `Successfully left the room`,
              });
              return;
            }
          });
        });
      }
    } else {
      logError(`user is not logged in, cannot leave the room`);

      callback({
        status: false,
        err: `cannot leave the room as you are not logged in`,
      });
      return;
    }
  });
};

module.exports = leaveRoom;
