const {
  logSuccess,
  logError,
  logWarn,
  logInfo,
  logFatal,
} = require("./logs.js");

// sends a message to everyone in given room except the sender
const sendRoomMessage = (
  io,
  socket,
  type,
  username,
  message,
  roomId,
  toSender = false
) => {
  // checking if recieved the data needed
  if (type && username && message && roomId) {
    // checking if we want the sender to also recieve the message
    if (toSender) {
      //sending room message to everyone in room, including sender
      io.in(`${roomId}`).emit(`chat-message`, {
        type: type === `user` ? 1 : 0,
        message,
        username,
      });
      return true;
    } else {
      //sending room message to everyone in the room except the sender
      socket.to(`${roomId}`).emit(`chat-message`, {
        type: type === `user` ? 1 : 0,
        message,
        username,
      });
      return true;
    }

    // missing data
  } else return false;
};

module.exports = sendRoomMessage;
