const app = require("express")();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

const {
  logSuccess,
  logError,
  logWarn,
  logInfo,
  logFatal,
} = require("./src/functions/logs.js");
const signIn = require(`./src/functions/signIn.js`);
const generateId = require("./src/functions/generateId.js");
const createDatabaseConnection = require("./src/functions/dbconnection.js");
const config = require(`./src/functions/config.js`);
const isLoggedIn = require(`./src/functions/isLoggedIn.js`);
const getRoomInfo = require(`./src/functions/getRoomInfo.js`);
const joinRoom = require(`./src/functions/joinRoom.js`);
const sendRoomMessage = require(`./src/functions/sendRoomMessage.js`);
const leaveRoom = require(`./src/functions/leaveRoom.js`);
const signUp = require(`./src/functions/signUp.js`);
const roomsToArray = require(`./src/functions/roomsToArray.js`);
const createRoom = require(`./src/functions/createRoom.js`);
const gameStart = require(`./src/functions/gameStart.js`);
const logout = require(`./src/functions/logout.js`);

const PORT = process.env.PORT || 4000;

// variable storing all the active sessions
// session = {sessionId, userId, socketId, username, isInGame, roomId}
let sessions = {};

// variable storing all the sockets connected to the server
let connections = [];

// // variable storing all the active rooms
// room = {id, owner, name,password, connectedPlayers, maxPlayers, decks, pointsToWin, language, isGameReady, isGameStarted, gameInterval}
let rooms = {};

// creating the database connection
createDatabaseConnection();

// function handling the new connection
io.on(`connection`, (socket) => {
  logSuccess(`socket of id: ${socket.id} just connected to the application`);

  // pushing new socket.id into connected sockets array
  connections = [...connections, socket.id];

  logInfo(`connected socket ids: ${connections}`);

  // a function that will send the user a list of active game rooms
  socket.on("get-roomslist", (data, callback) => {
    callback(roomsToArray(rooms));
  });

  // data { message, username }
  // client sends chat-message event, server recieves the message and
  // 	sends it to all clients connected to that specific room
  socket.on(`chat-message`, (data) => {
    logInfo(`chat-message event`);

    if (!socket.authenticated) {
      logWarn(`socket not authenticated, failed to send a chat message`);
      return;
    }

    logInfo(`session id in socket connection: ${socket.sessionId}`);

    // getting roomid in session of user sending the chat message
    let roomId = sessions[socket.sessionId].getRoomId();

    if (typeof roomId === `undefined`) {
      logError(`room of room id found in user's session doesn't exist`);
      return;
    }

    logInfo(`room id of room the user is sending message to: ${roomId}`);

    // sending message to all the users in that room
    if (
      !sendRoomMessage(io, socket, `user`, data.username, data.message, roomId)
    )
      logError(
        `failed to send the message, missing username or message or room id`
      );
  });

  // receives sessionid of user, returns data about the room the user is in: room name, users names, points to win, language
  socket.on(`get-roominfo`, (sessionId, callback) => {
    // checking if user is logged in, updating the session if necessary, returning roomid that you are in
    isLoggedIn(sessions, socket, rooms, sessionId, (response) => {
      // user is logged in, proceeding with getting the data
      if (response.status) {
        let roomId = sessions[sessionId].getRoomId();

        logInfo(
          `user is logged in, getting data of room of id: ${roomId} in get-roominfo event`
        );

        // getting the info about specified room
        getRoomInfo(rooms, roomId, (response) => {
          logSuccess(`sending the data about the room to the client`);
          callback(response);
        });

        // user is not logged in
      } else {
        logError(
          `error while checking if user trying to get room info is logged in: ${JSON.stringify(
            response.err
          )}`
        );
        callback(response);
      }
    });
  });

  // a socket that will create a room based on recieved data
  socket.on("create-room", (data, callback) => {
    // data stores the following:
    // session id of the user
    // room name
    // password protecting the room
    // maximal number of connected users
    // number of points to win a game
    // room language

    let requestSessionId = data.sessionId;

    // function checks if the user is logged in before creating a room
    isLoggedIn(sessions, socket, rooms, requestSessionId, (response) => {
      // user is logged in
      if (response.status) {
        logInfo(`session id of user creating the room: ${socket.sessionId}`);

        // user id and username from the session
        createRoom(data, sessions, io, socket, rooms, (response) => {
          if (response.status) logSuccess(`create room callback successful`);
          else logError(`create room callback failure, err: ${response.err}`);
          callback(response);
        });

        // user is not logged in
      } else {
        logError(`user is not logged in, cannot crate a room`);

        callback({
          status: false,
          err: "User not logged in, cannot create a room",
        });
        return;
      }
    });
  });

  // socket that returns the state of the room, if its ready to start the game
  socket.on(`room-ready-state`, (sessionId) => {
    isLoggedIn(sessions, socket, rooms, sessionId, (response) => {
      if (response.status) {
        // getting room id and userid of owner of the room
        let roomId = sessions[sessionId].getRoomId();
        let ownerUserId = rooms[roomId].owner.id;

        // this socket is the owner
        if (sessions[sessionId].getUserId() === ownerUserId) {
          logFatal(
            `user: ${sessions[
              sessionId
            ].getUsername()} is the owner, sending him the room-ready-state`
          );
          socket.emit(`room-ready-state`, {
            status: rooms[roomId].isGameReady,
          });
          return;

          // user asking for room-ready-state is not the owner of the room
        } else {
          logFatal(
            `user: ${sessions[
              sessionId
            ].getUsername()} is not the owner, cannot send him room-ready-state`
          );
        }
        // islogged in says youre not logged in
      } else {
        logError(`you are not logged in`);
        return;
      }
    });
  });

  socket.on(`game-start`, (sessionId, callback) => {
    logInfo(`game-start event triggered`);

    isLoggedIn(sessions, socket, rooms, sessionId, (response) => {
      if (response.status) {
        logInfo(`user is logged in, starting the game`);

        gameStart(io, socket, sessions, sessionId, rooms, (response) => {
          if (response.status) {
            logSuccess(`game successfuly started`);

            //let roomId = sessions[sessionId].roomId;

            //rooms[roomId].gameInterval = setInterval(() => {

            //sendRoomMessage(io, socket, `system`, `System`, `game running...`, roomId, true);

            //logFatal(`game running...`);
            //}, 2000);

            // failed to start the game
          } else {
            logError(`failed to start the game: ${response.err}`);
          }

          callback(response);
        });

        // user is not logged in
      } else {
        logWarn(`the user is not logged in, cannot start the game`);

        callback({
          status: false,
          err: `not logged in, cannot start the game`,
        });
        return;
      }
    });
  });

  // socket.on(`game-stop`, (sessionId, callback) => {

  // 	let roomId = sessions[sessionId].getRoomId();

  // 	logWarn(`stopping the game interval of room: ${roomId}`);

  // 	//clearInterval(rooms[roomId].gameInterval);

  // 	rooms[roomId].isGameStarted = false;
  // });

  // server recieves session id, room id and password protecting the room,
  // we join the player to given room
  socket.on("join-room", (data, callback) => {
    // getting data from the request
    const { sessionId, roomId, roomPassword } = data;

    logInfo(`join-room event triggered`);

    // checking if the user is logged in by his session id from browsers cookies
    isLoggedIn(sessions, socket, rooms, sessionId, (response) => {
      // means that this session exists
      if (response.status) {
        logWarn(
          `user: ${sessions[
            sessionId
          ].getUsername()} is trying to join room of id: ${roomId}`
        );

        // joining the user to the room of given id
        joinRoom(
          io,
          socket,
          rooms,
          sessions,
          roomId,
          roomPassword,
          (response) => {
            // successfully joined the room
            if (response.status) {
              // emitting all the rooms to this socket ???
              io.emit("rooms-list", roomsToArray(rooms));

              callback(response);
              return;

              // failed to join the room
            } else {
              logWarn(`error while joining a room: ${response.err}`);
              callback(response);
              return;
            }
          }
        );

        // the user is not logged in
      } else {
        logWarn(`user is not logged in, could not join the room`);

        callback({
          status: false,
          err: `User not logged in, could not join the room`,
        });
        return;
      }
    });
  });

  // recieves sessionId from browser cookies,
  // removes player from a room that hes currently in
  socket.on("leave-room", (sessionId, callback) => {
    logInfo(`leave-room event triggered`);

    // checking if player is logged in
    isLoggedIn(sessions, socket, rooms, sessionId, (response) => {
      // means that the user is logged in and we got the data about his session
      if (response.status) {
        logWarn(
          `user ${sessions[
            sessionId
          ].getUsername()} is trying to leave a game room he's in`
        );

        leaveRoom(io, socket, rooms, sessions, sessionId, (response) => {
          // successfully left the room
          if (response.status) {
            callback(response);
            return;
          } else {
            logError(`error while leaving a room: ${response.err}`);

            callback(response);
            return;
          }
        });

        // user is not logged in, cannot leave a room
      } else {
        logError(`user is not logged in, cannot leave a room`);

        callback({
          status: false,
          err: `User is not logged in, cannot leave the room`,
        });
        return;
      }
    });
  });

  // check-session socket recieves session id from the client
  // function that will in some circumstances check whether given session id belongs to an active session
  socket.on("check-session", (sessionId, callback) => {
    logInfo(`check-session event triggered`);

    logInfo(`searching for session of id: ${sessionId}`);

    // checks if session of given id exists
    isLoggedIn(sessions, socket, rooms, sessionId, (response) => {
      // in case session exists and has correct ids in it,
      // we send the user his username and room id in case he has a game associated with his session
      if (response.status) {
        callback({
          status: true,
          uname: sessions[sessionId].getUsername(),
          roomId: sessions[sessionId].getRoomId(),
        });
        return;

        // session id does not point to an active session
      } else {
        callback(response);
        return;
      }
    });
  });

  // a function that is handling signup requests
  socket.on("signup-attempt", (data, callback) => {
    logInfo(`signup-attempt event triggered`);

    // the data needed to create a new user is retrieved here
    const { username, password, email } = data;

    logInfo(
      `recieved data of the new user: ${username} | ${password} | ${email}`
    );

    if (username && password && email) {
      signUp(data, (response) => {
        if (response.status) {
          logSuccess(`successfully signed up the user`);
          callback(response);
        } else {
          logError(`an error occured while signing up: ${response.err}`);
          callback(response);
        }
      });
    } else {
      logError(
        `username, password or email not recieved in signup-attempt socket function`
      );

      callback({
        status: false,
        err: `username, password or email not recieved in signup-attempt socket`,
      });
      return;
    }
  });

  // function that will handle login attempts
  // data is a variable storing data sent by the client to the server
  // callback is a variable storing a function that will send a response to the client
  socket.on("signin-attempt", (data, callback) => {
    logInfo(`singin-attempt event triggered`);

    let sessionId = data.sessionId;

    // checks whether the client even has a session id in browser cookies,
    // if it does we check if an opened session exists
    if (sessionId) {
      logInfo(`user of session id: ${sessionId} tries to log in`);

      // checks whether the given session is active
      isLoggedIn(sessions, socket, rooms, sessionId, (response) => {
        // session id belongs to an active session
        if (response.status) {
          logSuccess(
            `this session id already points to an active session, username: ${sessions[
              sessionId
            ].getUsername()}`
          );

          callback({
            status: false,
            err: "User already logged in",
          });
          return;

          // session id does not point to an active session
        } else {
          logWarn(
            `session id: ${sessionId} does not point to an active session, logging in...`
          );

          signIn(sessions, socket, data, (response) => {
            // logged in
            if (response.status) {
              logSuccess("successfully logged in");

              callback({
                status: true,
                sessionId: socket.sessionId,
              });
              return;

              // failed to log in
            } else {
              logError(`an error occured while signing in, err: ${err}`);

              callback(response);
              return;
            }
          });
        }
      });

      // sessionid not provided, no session cookie in clients browser, logging in the user
    } else if (sessionId === "") {
      logInfo(`Sessionid not provided, logging in...`);

      signIn(sessions, socket, data, (response) => {
        // logged in
        if (response.status) {
          logSuccess("successfully logged in");

          callback({
            status: true,
            sessionId: socket.sessionId,
          });
          return;

          // failed to log in
        } else {
          logError(`an error occured while signing in, err: ${err}`);

          callback(response);
          return;
        }
      });

      // we await for either session id string or an empty string, in this case we
      // recieved neither of those, aborting
    } else {
      logFatal(
        `recieved session id is neither a correct session id string or an empty string indicating that the user is not logged in, logging in failed.`
      );

      callback({
        status: false,
        err: `session id is neither a correct session id string or an empty string indicating that the user is not logged in, logging in failed.`,
      });
      return;
    }
  });

  // gets session id from a cookie, checks if a session with that sessionid exists and removes it
  socket.on(`logout`, (data, callback) => {
    logInfo(`logout event triggered`);

    let sessionId = data.sessionId;

    logInfo(`checking if you are logged in in the first place`);

    isLoggedIn(sessions, socket, rooms, sessionId, (response) => {
      if (response.status) {
        logInfo(
          `${sessions[sessionId].username} is currently logged in, logging out`
        );

        logout(io, socket, rooms, sessions, sessionId, (response) => {
          callback(response);
        });
      } else {
        logError(`user is not logged in, cannot log out`);

        callback(response);

        return;
      }
    });
  });

  // function that will handle disconnect event
  // removes given socket.id from an array containing all the connected sockets
  socket.on("disconnect", () => {
    if (socket.authenticated) {
      if (!socket.sessionId) {
        logError(
          `session id not in socket connection object but session is apparently authenticated? XD`
        );
        return;
      } else
        logInfo(
          `${sessions[socket.sessionId].getUsername()} wants to disconnect`
        );
    } else logInfo(`user of socket id: ${socket.id} wants to disconnect`);

    for (let i = 0; i < connections.length; i++)
      if (connections[i] === socket.id) {
        connections.splice(i, 1);

        logSuccess(`socket of id: ${socket.id} just disconnected`);
        return;
      }

    logWarn(`haven't found a connection with that socket.id`);
  });
});

server.listen(PORT, () => logSuccess(`Listening on port ${PORT}`));
