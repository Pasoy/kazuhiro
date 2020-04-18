import initialState from "../constants/initialState";
import {
  GET_API,
  GET_LOGGED_IN,
  GET_ROOMS_LIST,
  GET_USERNAME,
  GET_ROOM_ID,
  GET_ROOM_INFO,
  ADD_NOTIFICATION,
  REMOVE_NOTIFICATION,
} from "../constants/action-types";

const generateId = require("../functions/generateId.js");

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_API:
      return { ...state, response: action.payload };
    case GET_LOGGED_IN:
      return { ...state, loggedIn: action.payload };
    case GET_ROOMS_LIST:
      return { ...state, rooms: action.payload };
    case GET_USERNAME:
      return { ...state, username: action.payload };
    case GET_ROOM_ID:
      return { ...state, joinedRoomId: action.payload };
    case GET_ROOM_INFO:
      return {
        ...state,
        joinedRoomInfo: { ...state.joinedRoomInfo, ...action.payload },
      };
    case ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [
          { id: generateId(5), ...action.payload },
          ...state.notifications,
        ],
      };
    case REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          (n) => n.id !== action.payload
        ),
      };
    default:
      return state;
  }
};

export default rootReducer;
