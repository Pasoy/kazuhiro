let mongoose = require("mongoose");

let userSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true },
  userId: { type: String, required: true },
  hours_played: { type: Number, required: true },
});

let User = mongoose.model("User", userSchema);

module.exports = User;
