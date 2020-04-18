const {
  logSuccess,
  logError,
  logWarn,
  logInfo,
  logFatal,
} = require("./logs.js");
const generateId = require("./generateId.js");
const config = require(`./config.js`);

class Session {
  constructor(socketId, userId, username) {
    this._sessionId = generateId(config.sessionid_length);
    this._socketId = socketId;
    this._userId = userId;
    this._username = username;
    this._isInGame = false;
    this._roomId = "";
  }

  getSessionId() {
    return this._sessionId;
  }

  getSocketId() {
    return this._socketId;
  }

  setSocketId(socketId) {
    this._socketId = socketId;
  }

  getUserId() {
    return this._userId;
  }

  getUsername() {
    return this._username;
  }

  getIsInGame() {
    return this._isInGame;
  }

  setIsInGame(isInGame) {
    this._isInGame = isInGame;
  }

  getRoomId() {
    return this._roomId;
  }

  setRoomId(roomId) {
    this._roomId = roomId;
  }

  show() {
    logInfo(
      `displaying session of id: ${this.getSessionId()}\nsocket id: ${this.getSocketId()}\nuser id: ${this.getUserId()}\nusername: ${this.getUsername()}\n${
        this.getIsInGame() ? "user is in game" : "user is not in game"
      }`
    );
  }
}

module.exports = Session;
