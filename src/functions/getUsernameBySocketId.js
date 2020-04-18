// recieves socket id, returns username from session associated with that socket id
const getUsernameBySocketId = (sessions, socketId) => {
  for (let session of sessions)
    if (session.getSocketId() === socketId) return session.username;
  return undefined;
};

module.exports = getUsernameBySocketId;
