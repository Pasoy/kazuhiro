const roomsToArray = (rooms) => {
  let rids = Object.keys(rooms);
  let rooms_arr = [];

  for (let i = 0; i < rids.length; i++) {
    rooms_arr = [...rooms_arr, rooms[rids[i]]];
  }

  return rooms_arr;
};

module.exports = roomsToArray;
