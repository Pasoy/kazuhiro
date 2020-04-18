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

export const getApi = (request) => {
  return {
    type: GET_API,
    payload: request,
  };
};
export const getLoggedIn = (request) => {
  return {
    type: GET_LOGGED_IN,
    payload: request,
  };
};
export const getRoomsList = (request) => {
  return {
    type: GET_ROOMS_LIST,
    payload: request,
  };
};
export const getUsername = (request) => {
  return {
    type: GET_USERNAME,
    payload: request,
  };
};
export const getRoomId = (request) => {
  return {
    type: GET_ROOM_ID,
    payload: request,
  };
};
export const getRoomInfo = (request) => {
  return {
    type: GET_ROOM_INFO,
    payload: request,
  };
};
export const addNotification = (request) => {
  return {
    type: ADD_NOTIFICATION,
    payload: request,
  };
};
export const removeNotification = (request) => {
  return {
    type: REMOVE_NOTIFICATION,
    payload: request,
  };
};
