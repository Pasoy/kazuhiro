const generateId = require(`./generateId.js`);
const joinRoom = require(`./joinRoom.js`);
const {
  logError,
  logInfo,
  logSuccess,
  logFatal,
  logWarn,
} = require(`./logs.js`);
const config = require(`./config.js`);
const roomsToArray = require(`./roomsToArray.js`);

const createRoom = (data, sessions, io, socket, rooms, callback) => {
  let owner = {
    id: sessions[socket.sessionId].getUserId(),
    name: sessions[socket.sessionId].getUsername(),
  };

  // room name that the user specified
  let roomName = data.roomName;

  // room password that the user specified
  let roomPassword = data.roomPassword;

  logInfo(
    `user: ${owner.name} is creating a room which name will be: ${roomName}`
  );

  // generating a room id
  let roomId = generateId(config.roomid_length);

  logInfo(`generated room id: ${roomId}`);

  // max number of connected players
  let maxPlayers = data.roomMaxPlayers;

  if (maxPlayers <= 2) {
    logWarn(`maxplayers cannot be lower than 3`);
    callback({
      status: false,
      err: `maxplayers cannot be lower than 3`,
    });
    return;
  }

  // points needed for any of the players to win
  let pointsToWin = data.roomPoints;

  // room language
  let language = "English";

  // room object that will represent the room
  let room = {
    id: roomId,
    owner: owner,
    name: roomName,
    password: roomPassword,
    connectedPlayers: {},
    maxPlayers,
    decks: [],
    pointsToWin,
    language,
    isGameReady: false,
    isGameStarted: false,
    gameInterval: undefined,
  };

  logInfo(`pushing a room to rooms array: ${JSON.stringify(room)}`);

  //pushing room to list of all rooms
  rooms[roomId] = room;

  logSuccess("successfully created a room");

  logInfo(`joining the created room`);

  // joining the user to a room
  joinRoom(io, socket, rooms, sessions, roomId, roomPassword, (response) => {
    // successfully joined the room
    if (response.status) {
      logSuccess(
        `successfully joined the created room, all existing rooms: ${JSON.stringify(
          rooms
        )}`
      );

      // sending all the connected users an array holding all the rooms
      // excluding the room's password so user cannot access it
      io.emit("rooms-list", roomsToArray(rooms));

      // sending response to the client
      callback({
        status: true,
        mess: `Created room of id: ${roomId} and name: ${room.name}`,
        roomId: room.id,
      });
      return;

      // failed to join a room
    } else {
      logError(
        `failed to join given room after creating it, error: ${response.err}`
      );
      callback({
        status: false,
        err: `failed to join created room, error: ${response.err}`,
      });
      return;
    }
  });
};

module.exports = createRoom;
