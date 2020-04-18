const sendPrivateMessage = (io, type, username, message, socketId) => {
  if (type && username && message && socketId) {
    // sending socket.io message to specific client
    io.sockets.to(`${socketId}`).emit(`chat-message`, {
      type: type === `user` ? 1 : 0,
      username,
      message,
    });
    return true;

    // missing data
  } else return false;
};

module.exports = sendPrivateMessage;
