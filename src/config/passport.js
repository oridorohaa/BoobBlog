const passport = require("passport");
const mongoose = require("mongoose");
const LocalStrategy = require("passport-local");

const Users = mongoose.model("User");
