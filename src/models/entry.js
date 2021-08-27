const mongoose = require("mongoose");
const validator = require("validator");

const entrySchema = new mongoose.Schema(
  {
    entry: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Entry = mongoose.model("Entry", entrySchema);
module.exports = Entry;
