const express = require("express");
const path = require("path");
const http = require("http");
const bodyParser = require("body-parser");
const entryRouter = require("./routers/user");
const exphbs = require("express-handlebars");
const User = require("./models/user");
const Entry = require("./models/entry");
const Comment = require("./models/comment");
const cookieParser = require("cookie-parser");

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

//----------Middlewear function
const authUser = async (req, res, next) => {
  console.log("auth user");
  email = req.body.email ?? req.cookies["email"];
  password = req.body.password ?? req.cookies["password"];
  console.log(email);
  console.log(password);
  req.user = await User.findByCredentials(email, password);
  console.log(req.user);
  if (req.user) {
    res.cookie("email", req.user.email);
    res.cookie("password", req.user.password);
    next();
  } else {
    res.redirect("/");
  }
};

//--------------------- Routers
//----------ENTRY routers

app.post("/entry", authUser, async (req, res, next) => {
  const entry = new Entry({
    ...req.body,
    owner: req.user._id,
  });
  await entry.save();

  console.log(entry);
  // res.json(entry);
  res.render("posts");
  //   res.render("", { task: task.toObject() });
});

app.get("/entry/:id", authUser, async (req, res) => {
  console.log("in the MYENTRY, thisis the req ");
  console.log(req.params);
  const _id = req.params.id;
  const entry = await Entry.findOne({ _id });
  console.log(entry);
  const entryObj = entry.toObject();
  const currentUser = await User.findById(req.user._id);
  const currentUserObj = currentUser.toObject();

  res.render("oneEntry", { entryObj, currentUserObj });
});

app.get("/allPosts", authUser, async (req, res) => {
  const posts = await Entry.find();
  console.log("this is ALL POSTS, this is the POSTS");
  posts.forEach((post) => {
    console.log(post.owner);
  });

  const postsObj = posts.map((post) => post.toObject());

  const users = await User.find();
  console.log(users);
  const usersObj = users.map((user) => user.toObject());

  await Promise.all(
    postsObj.map(async (post) => {
      console.log("inside MAP");
      const currentUser = await User.findById(post.owner);
      post.user = currentUser.toObject();
      // const currentUserObj = currentUser.toObject();
      console.log(post.user.name);
    })
  );
  //---passing all users on the other side of the same page
  console.log(usersObj);
  res.render("posts", { postsObj, usersObj });
});

//-------------USERS routers

app.get("/allUsers", authUser, async (req, res) => {
  const users = await User.find();
  const usersObj = users.toObject();
});

app.get("/userProfile/:id", authUser, async (req, res) => {
  console.log("INSIDE ABOUT different user :ID");
  console.log(req.params);
  console.log(req);
  const _id = req.params.id;
  console.log("page user:", req.params.id);
  const currentUser = await User.findById(_id);
  console.log(currentUser);
  const currentUserObj = currentUser.toObject();

  const entries = await Entry.find({ owner: _id });
  const entriesObj = entries.map((entry) => {
    return entry.toObject();
  });

  console.log(entries);

  res.render("aboutUser", { currentUserObj, entriesObj });
});

app.get("/about", authUser, async (req, res) => {
  console.log("We are inside the ABOUT USER --- this is the REQ.USER");
  console.log(req.user);
  const myPosts = await Entry.find({ owner: req.user._id });
  const currentUser = await User.findById(req.user._id);
  console.log("This is the CURRENT USER OBJ");
  console.log(currentUser.name);
  console.log(currentUser);
  const currentUserObj = currentUser.toObject();
  console.log("These are posts of ONE USER");
  console.log(myPosts);
  const myPostsObj = myPosts.map((post) => post.toObject());
  console.log(currentUserObj.name);
  res.render("aboutMe", {
    user: req.user.toObject(),
    myPostsObj,
    currentUserObj,
  });
  // console.log(req.cookies);
  // const myPosts = await Entry.findById({});
});

app.get("/home", authUser, (req, res) => {
  res.render("home");
});

app.post("/startBlog", async (req, res) => {
  const user = new User(req.body);

  await user.save();
  console.log(user);
  // res.json(user);
  const token = await user.generateAuthToken();
  console.log(token);
  res.cookie("email", user.email);
  res.cookie("password", user.password);

  // jwt.sign();
  res.render("blog", { user: user.toObject() });
});

app.post("/users/login", authUser, async (req, res, next) => {
  //res.redirect("/");
  console.log("after in user/login");
  res.render("blog", { user: req.user.toObject() });
});

app.get("/logout", authUser, async (req, res) => {
  res.clearCookie("email");
  res.clearCookie("password");
  res.render("logout");
});

//-------COMMENT routers

app.post("/comment", authUser, async (req, res) => {
  console.log("INSIDE COMMENT POST request");
  console.log("this is REQ:", req);
  const comment = new Comment({
    ...req.body,
    owner: req.user._id,
    // entry: req.entry._id,
  });
  await comment.save();
  console.log(comment);
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
