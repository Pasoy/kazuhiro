const {
  logSuccess,
  logError,
  logWarn,
  logInfo,
  logFatal,
} = require("./logs.js");

const getRoomInfo = (rooms, roomId, callback) => {
  // checking if roomId exists
  if (typeof roomId !== `string`) {
    logError(`roomId not specified in getRoomInfo function`);

    callback({
      status: false,
      err: `room id undefined`,
    });
    return;
  }

  // checking if room exists
  if (!rooms[roomId]) {
    logError(`room that we want to get data from doesn't exist`);

    callback({
      status: false,
      err: `room doesn't exist`,
    });
    return;
  }

  logSuccess(`found the room we want to get data about`);

  let name = rooms[roomId].name,
    pointsToWin = rooms[roomId].pointsToWin,
    language = rooms[roomId].language,
    maxPlayers = rooms[roomId].maxPlayers;

  let connectedPlayers = [];

  let keys = Object.keys(rooms[roomId].connectedPlayers);

  keys.forEach((key) => {
    let current_username = rooms[roomId].connectedPlayers[key].username;
    let current_points = rooms[roomId].connectedPlayers[key].points;

    logSuccess(`found ${current_username} in room`);

    let player = {
      username: current_username,
      points: current_points,
    };

    connectedPlayers = [...connectedPlayers, player];
  });

  let obj = {
    status: true,
    name,
    connectedPlayers,
    maxPlayers,
    pointsToWin,
    language,
  };

  logInfo(`got all the data about the room, sending it up`);

  callback(obj);
  return;
};

module.exports = getRoomInfo;
