const {
  logSuccess,
  logError,
  logWarn,
  logInfo,
  logFatal,
} = require("./logs.js");
const sendRoomMessage = require(`./sendRoomMessage.js`);
const getRoomInfo = require(`./getRoomInfo.js`);
const isLoggedIn = require(`./isLoggedIn.js`);

// function that will push socket id of user wanting to join the room into
// 	this room's connected users array
const joinRoom = (io, socket, rooms, sessions, roomId, password, callback) => {
  logInfo(`searching for room of id: ${roomId}`);

  // checking if user is logged in
  isLoggedIn(sessions, socket, rooms, socket.sessionId, (response) => {
    // if user is logged in
    if (response.status) {
      logInfo(`checking if user is already in-game`);

      if (
        sessions[socket.sessionId].getIsInGame() &&
        sessions[socket.sessionId].getRoomId()
      ) {
        logWarn(`user is already in some room, cannot join the room.`);

        callback({
          status: false,
          err: `user is already in game`,
        });
        return;
      }

      // checking if room exists
      if (!rooms[roomId]) {
        logError(`the room you want to join doesn't exist`);

        callback({
          status: false,
          err: `the room you want to join doesn't exist`,
        });
        return;
      }

      logSuccess(`found a room of id: ${roomId}`);

      logInfo(`checking room's availability...`);

      // getting current number of players in game and the max number of players allowed by the creator of the room
      let current_occupation = Object.keys(rooms[roomId].connectedPlayers)
        .length;

      let max_allowed_occupation = rooms[roomId].maxPlayers;

      logInfo(
        `number of players in room: ${current_occupation}, max allowed players: ${rooms[roomId].maxPlayers}`
      );

      // checking if theres an available place for you in the room
      if (current_occupation >= max_allowed_occupation) {
        logWarn(`the room is full, cannot join`);
        callback({
          status: false,
          err: `the room is full, cannot join`,
        });
        return;
      }

      logSuccess(`the room is not full, proceeding...`);

      logInfo(`room.password: ${rooms[roomId].password}`);
      logInfo(`recieved password: ${password}`);

      // in case given password is incorrect
      if (rooms[roomId].password !== password) {
        logWarn(`wrong password, will not join the room`);

        callback({
          status: false,
          err: `wrong password`,
        });
        return;
      }

      logInfo(`given password is correct`);

      logInfo(`joining socket.io room of id: ${roomId}`);

      socket.join(`${roomId}`);

      sessions[socket.sessionId].setRoomId(roomId);

      sessions[socket.sessionId].setIsInGame(true);

      let username = sessions[socket.sessionId].getUsername();
      let socketId = socket.id;
      let userId = sessions[socket.sessionId].getUserId();
      let points = 0;

      rooms[roomId].connectedPlayers[userId] = {
        username,
        userId,
        socketId,
        points,
      };

      // if the room is not ready to start the game we check if it can get ready after the user joined the room
      if (!rooms[roomId].isGameReady) {
        // if there is more than 3 users in the room we set isGameReady flag to true
        if (Object.keys(rooms[roomId].connectedPlayers).length >= 3) {
          logInfo(`room: ${rooms[roomId].name} is now ready to start the game`);

          sendRoomMessage(
            io,
            socket,
            `system`,
            `System`,
            `The game can now be started`,
            roomId,
            true
          );

          rooms[roomId].isGameReady = true;

          logInfo(`getting ownerUserid`);

          const ownerUserId = rooms[roomId].owner.id;

          if (!rooms[roomId].connectedPlayers[ownerUserId]) {
            logFatal(`user of owner id doesn't exist in the room`);
          } else {
            let ownerSocketId =
              rooms[roomId].connectedPlayers[ownerUserId].socketId;

            logInfo(`ownerSocketId we just got: ${ownerSocketId}`);

            io.sockets.to(`${ownerSocketId}`).emit(`room-ready-state`, {
              status: true,
            });
          }
        }
      }

      logSuccess(`Successfully connected the user`);

      if (
        !sendRoomMessage(
          io,
          socket,
          "system",
          username,
          `${username} has joined the room`,
          roomId
        )
      )
        logError(
          `failed to send the message, missing username or type or roomid or message`
        );

      // getting room data and sending updated state to all connected users
      getRoomInfo(rooms, roomId, (response) => {
        if (response.status) {
          logInfo(`sending data about the updated room to all connected users`);

          // sending updated gameroom to all players
          socket.to(`${roomId}`).emit(`room-update`, response);

          callback({
            status: true,
            mess: `successfully joined the room`,
          });
          return;
        } else {
          logError(
            `error while sending room data of updated room: ${response.err}`
          );

          // notifying users that the user joined the room but failed to send data
          //  of updated room to all clients
          callback({
            status: false,
            err: `failed to send updated rooms data to connected clients`,
          });
          return;
        }
      });

      // user is not logged in
    } else {
      logError(response.err);
      callback(response);
      return;
    }
  });
};

module.exports = joinRoom;
