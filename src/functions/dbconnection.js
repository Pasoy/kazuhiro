const mongoose = require("mongoose");
const { logSuccess } = require(`./logs.js`);

const DB_USER = "pasoy-test",
  DB_PASSWORD = "RPZJMsei4v#ZjjegsvVV";

module.exports = () => {
  mongoose.connect(
    `mongodb://${DB_USER}:${DB_PASSWORD}@ds241647.mlab.com:41647/pasoy-kazuhiro`,
    { useNewUrlParser: true }
  );
  let db = mongoose.connection;
  db.on("error", console.error.bind(console, "connection error:"));
  db.once("open", () => {
    logSuccess(`Created a connection to the database!`);
  });
};
