const mongoose = require("mongoose");
const validator = require("validator");

const likesSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  entry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Entry",
  },
});

const Likes = mongoose.model("Likes", likesSchema);
module.exports = Likes;
