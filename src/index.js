const express = require("express");
const path = require("path");
const http = require("http");
const bodyParser = require("body-parser");
const entryRouter = require("./routers/user");
const exphbs = require("express-handlebars");
const User = require("./models/user");
const Entry = require("./models/entry");
const Likes = require("./models/likes");
const Comment = require("./models/comment");
const cookieParser = require("cookie-parser");

const twilio = require("twilio");
// import {
//   TWILIO_ACCOUNT_SID,
//   TWILIO_AUTH_TOKEN,
//   YOUR_NUMBER,
//   YOUR_TWILIO_NUMBER,
// }  from ("./ middleware/tokens");
const TWILIO_ACCOUNT_SID = "ACe638b0695b5553718ee571fd0147f313";
const TWILIO_AUTH_TOKEN = "a948483e97516c5be4aaa4d3fb4f80a5";
const YOUR_NUMBER = "+19176695628";
const ASHOT_NUMBER = "+14152179469";
const SVIT_NUMBER = "+19176696763";

const YOUR_TWILIO_NUMBER = "+19254489114";

const bcrypt = require("bcryptjs");
const app = express();
const server = http.createServer(app);

const port = process.env.PORT || 5000;
const publicDirectoryPath = path.join(__dirname, "../public");

// app.use((req, res, next) => {
//   res.status(503).send("Site is currently down! Come back soon!");
// });

app
  .use(express.static(publicDirectoryPath))
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json())
  .use(express.json());

app.use(cookieParser());
app.set("views", path.join(__dirname, "../public/views"));
app.engine(
  "hbs",
  exphbs({
    extname: "hbs",
  })
);

app.set("view engine", "hbs");

var hbs = exphbs.create({});

hbs.handlebars.registerHelper("debug", function (emberObject) {
  if (emberObject && emberObject.contexts) {
    var out = "";

    for (var context in emberObject.contexts) {
      for (var prop in context) {
        out += prop + ": " + context[prop] + "\n";
      }
    }

    if (console && console.log) {
      console.log("Debug\n----------------\n" + out);
    }
  }
});

hbs.handlebars.registerHelper("json", function (context) {
  return JSON.stringify(context);
});

//Sending Text Message
// const client = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
// client.messages.create({
//   to: YOUR_NUMBER,
//   from: YOUR_TWILIO_NUMBER,
//   body: "Welcome to the Boob World",
// });

//----------Middlewear function
const authUser = async (req, res, next) => {
  email = req.body.email ?? req.cookies["email"];
  password = req.body.password ?? req.cookies["password"];
  req.user = await User.findByCredentials(email, password);
  if (req.user) {
    res.cookie("email", req.user.email);
    res.cookie("password", req.user.password);
    next();
  } else {
    res.redirect("/");
  }
};

//----------------Helper functions-------------

const decoratePost = async (postsObj, user_id) => {
  //comments count
  await Promise.all(
    postsObj.map(async (post) => {
      post.commentsCount = await Comment.find({ entry: post._id }).count();
      post.likesCount = await Likes.find({ entry: post._id }).count();
      post.liked = await Likes.find({
        owner: user_id,
        entry: post._id,
      });
    })
  );
};

//Days ago Function
const daysAgo = (postsObj) => {
  postsObj.forEach((post) => {
    const daySince = parseInt(
      (new Date() - new Date(post.createdAt)) / 86400000
    );
    post.daySince = daySince;
    return console.log("This is the days ago:", daySince);
  });
};

//--------------------------ENTRY routers-------------------
app.post("/entry", authUser, async (req, res, next) => {
  const entry = new Entry({
    ...req.body,
    owner: req.user._id,
  });
  await entry.save();

  const entryObj = entry.toObject();
  // daysAgo(entryObj);

  ///////-------------NOTE: work on rendering the new post into the list of posts
  const currentUser = await User.findById(req.user._id);
  const currentUserObj = currentUser.toObject();
  const client = new twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  client.messages.create({
    to: ASHOT_NUMBER,
    from: YOUR_TWILIO_NUMBER,
    body: "Boob Alert - New Post was made",
  });
  res.render("oneEntry", { entryObj, currentUserObj });
  //   res.render("", { task: task.toObject() });
});

app.get("/entry/:id", authUser, async (req, res) => {
  const _id = req.params.id;
  const entry = await Entry.findOne({ _id });
  const entryObj = entry.toObject();
  const currentUser = await User.findById(req.user._id);
  const currentUserObj = currentUser.toObject();

  // daysAgo(entryObj);

  const allComments = await Comment.find({ entry: _id });
  const allCommentsObj = allComments.map((comment) => comment.toObject());
  res.render("oneEntry", { entryObj, currentUserObj, allCommentsObj });
});

app.get("/allPosts", authUser, async (req, res) => {
  let posts = await Entry.find().sort({ createdAt: -1 });
  let postsObj = posts.map((post) => post.toObject());

  const users = await User.find().sort({ createdAt: -1 });
  const usersObj = users.map((user) => user.toObject());

  await Promise.all(
    postsObj.map(async (post) => {
      const currentUser = await User.findById(post.owner);
      post.user = currentUser.toObject();
    })
  );

  daysAgo(postsObj);
  await decoratePost(postsObj, req.user._id);

  //---passing all users on the other side of the same page
  res.render("posts", { postsObj, usersObj });
});

app.get("/deletePost/:id", authUser, async (req, res) => {
  const _id = req.params.id;
  // await Entry.findOneAndDelete({ _id });

  console.log("REQ.USER.ID:", typeof req.user.id);
  entry = await Entry.findOne({ _id: req.params.id });
  console.log("ENTRY.OWNER:", typeof entry.owner);

  if (entry.owner.toString() === req.user.id) {
    await Entry.findOneAndDelete({ _id });
    console.log("One Post Deleted");
  } else {
    res.send("You are not Authorized to delete this Post");
    return;
  }
  res.redirect(req.get("referer"));
});

//-----------------------USERS routers-----------------

app.get("/allUsers", authUser, async (req, res) => {
  const users = await User.find();
  const usersObj = users.toObject();
});

app.get("/userProfile/:id", authUser, async (req, res) => {
  const _id = req.params.id;
  const currentUser = await User.findById(_id);
  const currentUserObj = currentUser.toObject();

  let posts = await Entry.find({ owner: _id }).sort({ createdAt: -1 });
  let postsObj = posts.map((entry) => {
    return entry.toObject();
  });

  daysAgo(postsObj);
  await decoratePost(postsObj, req.user._id);

  res.render("aboutUser", { currentUserObj, postsObj });
});

app.get("/about", authUser, async (req, res) => {
  let posts = await Entry.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });
  let postsObj = posts.map((post) => post.toObject());
  const currentUser = await User.findById(req.user._id);
  const currentUserObj = currentUser.toObject();

  daysAgo(postsObj);
  await decoratePost(postsObj, req.user._id);

  res.render("aboutMe", {
    user: req.user.toObject(),
    postsObj,
    currentUserObj,
  });
});

app.get("/home", authUser, (req, res) => {
  res.render("home");
});

app.post("/startBlog", async (req, res) => {
  const user = new User(req.body);

  await user.save();
  const token = await user.generateAuthToken();
  res.cookie("email", user.email);
  res.cookie("password", user.password);

  res.render("blog", { user: user.toObject() });
});

app.post("/users/login", authUser, async (req, res, next) => {
  res.render("blog", { user: req.user.toObject() });
});

app.get("/logout", authUser, async (req, res) => {
  res.clearCookie("email");
  res.clearCookie("password");
  res.render("logout");
});

//-----------------------COMMENT routers----------------

app.post("/comment/:id", authUser, async (req, res) => {
  // console.log("INSIDE COMMENT POST request");
  console.log(req.params.id);
  const comment = new Comment({
    ...req.body,
    owner: req.user._id,
    entry: req.params.id,
  });
  await comment.save();
  const commentObj = comment.toObject();

  res.redirect(`/entry/${req.params.id}`);
  // res.render("oneEntry");
});

app.get("/comments/:id", async (req, res) => {
  const allComments = await Comment.find({ entry: req.params.id });
  const allCommentsObj = allComments.map((comment) => {
    comment.toObject();
  });
  res.render("oneEntry", allCommentsObj);
});

//-----------------------LIKES Routers--------------
app.get("/like/:id", authUser, async (req, res) => {
  doc = { owner: req.user.id, entry: req.params.id };
  await Likes.findOneAndUpdate(doc, doc, { new: true, upsert: true });

  res.redirect(req.get("referer"));
});

///////////////////////////////////
const { MongoClient, ObjectID } = require("mongodb");

const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "blog-app";

MongoClient.connect(
  connectionURL,
  { useUnifiedTopology: true },
  { useNewUrlParser: true },
  (error, client) => {
    if (error) {
      return console.log("unable to connect to database!");
    }
    const db = client.db(databaseName);
  }
);

//Mongoose connect to MongoDB
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/blog-app-api", {
  useNewUrlParser: true,
  useCreateIndex: true,
});

const con = mongoose.connection;
con.on("open", () => {
  console.log("Connected...");
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

//////--------------------------------------------
