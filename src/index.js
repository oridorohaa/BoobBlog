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

//--------------------- Routers

const getTimeAgo = (date) => {
  let string = "";
  let d = (new Date() - new Date(date)) / 1000;
  let s = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };
  if (d <= 60) {
    return `${d} seconds ago `;
  }
  if (d <= 360) return string;

  //////--------------------------------------------
  // let string = "";
  let millisecondSince = parseInt(new Date() - new Date(entryObj.createdAt));
  // string += `${millisecondSince} milliseconds ago`;
  if (millisecondSince <= 1 && millisecondSince > 0)
    string += `${millisecondSince} millisecond ago`;

  if (millisecondsSince > 1) string += `${millisecondSince} milliseconds ago`;
  if (millisecondsSince >= 1000) {
    let secondsAgo = parseInt(
      (new Date() - new Date(entryObj.createdAt)) / 1000
    );
    if (secondsAgo <= 1 && secondsAgo > 0) string += `${secondsAgo} second ago`;
    if (secondsAgo > 1) string += `${secondsAgo} seconds ago`;
    if (secondsAgo >= 60) {
      let minuteSince = parseInt(
        (newDate() - new Date(entryObj.createdAt)) / 60000
      );
    }
  }
  let hourSince = parseInt(
    (new Date() - new Date(entryOnj.createdAt)) / 3600000
  );
  let daySince = parseInt(
    (new Date() - new Date(entryObj.createdAt)) / 86400000
  );
  // entryObj.daySince = daySince;
  let monthSince;
  let yearSince;
};

//--------------------------ENTRY routers-------------------
app.post("/entry", authUser, async (req, res, next) => {
  const entry = new Entry({
    ...req.body,
    owner: req.user._id,
  });
  await entry.save();

  const entryObj = entry.toObject();
  const daySince = parseInt(
    (new Date() - new Date(entryObj.createdAt)) / 86400000
  );
  entryObj.daySince = daySince;

  ///////-------------NOTE: work on rendering the new post into the list of posts
  const currentUser = await User.findById(req.user._id);
  const currentUserObj = currentUser.toObject();
  res.render("oneEntry", { entryObj, currentUserObj });
  //   res.render("", { task: task.toObject() });
});

app.get("/entry/:id", authUser, async (req, res) => {
  const _id = req.params.id;
  const entry = await Entry.findOne({ _id });
  const entryObj = entry.toObject();
  const currentUser = await User.findById(req.user._id);
  const currentUserObj = currentUser.toObject();

  const daySince = parseInt(
    (new Date() - new Date(entryObj.createdAt)) / 86400000
  );
  entryObj.daySince = daySince;

  const allComments = await Comment.find({ entry: _id });
  const allCommentsObj = allComments.map((comment) => comment.toObject());
  res.render("oneEntry", { entryObj, currentUserObj, allCommentsObj });
});

app.get("/allPosts", authUser, async (req, res) => {
  const posts = await Entry.find().sort({ createdAt: -1 });
  posts.forEach((post) => {});

  const postsObj = posts.map((post) => post.toObject());

  postsObj.forEach((post) => {
    const daySince = parseInt(
      (new Date() - new Date(post.createdAt)) / 86400000
    );
    post.daySince = daySince;
    return console.log("This is the days ago:", daySince);
  });

  const users = await User.find();
  const usersObj = users.map((user) => user.toObject());

  await Promise.all(
    postsObj.map(async (post) => {
      const currentUser = await User.findById(post.owner);
      post.user = currentUser.toObject();
    })
  );
  await Promise.all(
    postsObj.map(async (post) => {
      const commentsCount = await Comment.find({ entry: post._id }).count();
      console.log("This is the Comments count in ALL POSTS:", commentsCount);
      post.commentsCount = commentsCount;
      if (commentsCount === 0) {
        //render nothing
      }
    })
  );
  await Promise.all(
    postsObj.map(async (post) => {
      const likesCount = await Likes.find({ entry: post._id }).count();
      post.likesCount = likesCount;
      console.log("This is the Likes Count:", likesCount);
    })
  );

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

  const entries = await Entry.find({ owner: _id }).sort({ createdAt: -1 });
  const entriesObj = entries.map((entry) => {
    return entry.toObject();
  });
  entriesObj.forEach((post) => {
    const daySince = parseInt(
      (new Date() - new Date(post.createdAt)) / 86400000
    );
    post.daySince = daySince;
  });

  await Promise.all(
    entriesObj.map(async (post) => {
      const commentsCount = await Comment.find({ entry: post._id }).count();
      console.log("This is the Comments count:", commentsCount);
      post.commentsCount = commentsCount;
      if (commentsCount === 0) {
        //render nothing
      }
    })
  );

  await Promise.all(
    entriesObj.map(async (post) => {
      const likesCount = await Likes.find({ entry: post._id }).count();
      post.likesCount = likesCount;
      console.log("This is the Likes Count:", likesCount);
    })
  );

  res.render("aboutUser", { currentUserObj, entriesObj });
});

app.get("/about", authUser, async (req, res) => {
  const myPosts = await Entry.find({ owner: req.user._id }).sort({
    createdAt: -1,
  });
  const currentUser = await User.findById(req.user._id);
  const currentUserObj = currentUser.toObject();
  const myPostsObj = myPosts.map((post) => post.toObject());
  myPostsObj.forEach((post) => {
    const daySince = parseInt(
      (new Date() - new Date(post.createdAt)) / 86400000
    );
    post.daySince = daySince;
  });

  await Promise.all(
    myPostsObj.map(async (post) => {
      const commentsCount = await Comment.find({ entry: post._id }).count();
      post.commentsCount = commentsCount;
      if (commentsCount === 0) {
        //render nothing
      }
    })
  );

  await Promise.all(
    myPostsObj.map(async (post) => {
      const likesCount = await Likes.find({ entry: post._id }).count();
      post.likesCount = likesCount;
      console.log("This is the Likes Count:", likesCount);
    })
  );

  res.render("aboutMe", {
    user: req.user.toObject(),
    myPostsObj,
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
