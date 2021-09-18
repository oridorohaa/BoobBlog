const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Entry = require("./entry");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    blog: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid Email Format!");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
    },
    likes: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Likes",
    },
    tokens: [
      {
        token: {
          type: String,
          require: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, "boobblog");

  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    return null;
    throw new Error("Email not registered");
  }
  // console.log(user, "Email not registered");
  const isMatch = password === user.password;
  console.log("password:", password, "user.password:", user.password);

  if (!isMatch) {
    return null;
    throw new Error("Wrong password. Try again!");
  }
  return user;
};
const User = mongoose.model("User", userSchema);
module.exports = User;
