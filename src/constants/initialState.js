import socketIOClient from "socket.io-client";

const initialState = {
  endpoint: "http://192.168.69.1:4000",
  socket: undefined,
  response: undefined,
  loggedIn: false,
  username: "Anonymous",
  rooms: [],
  joinedRoomId: "",
  joinedRoomInfo: {
    name: "",
    connectedPlayers: [],
    maxPlayers: 0,
    pointsToWin: 0,
    language: "",
  },
  notifications: [
    {
      id: "52s-_",
      type: "primary",
      time: 2000,
      message: "Welcome to Kazuhiro!",
    },
  ],
  /*{
      id: "53s-_",
      type: "success",
      time: 2500,
      message: "You've successfully logged in!",
    },
    {
      id: "54s-_",
      type: "warning",
      time: 4000,
      message: "It's not safe here, I'm warning you.",
    },
    {
      id: "55s-_",
      type: "danger",
      time: 0,
      message: "Wrong credentials.",
    },
  ],*/
};

initialState.socket = socketIOClient(initialState.endpoint);

export default initialState;
