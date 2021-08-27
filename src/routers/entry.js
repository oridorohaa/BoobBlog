const express = require("express");
const entryRouter = new express.Router();
const auth = require("../middleware/auth");
const Entry = require("../models/entry");

entryRouter.post("/entry", async (req, res) => {
  //   console.log(req.body, "Req.Body");
  //   const entry = new Entry({
  //     ...req.body,
  //     owner: req.user._id,
  //   });
  //   res.json(entry);
  //   //   res.render("", { task: task.toObject() });

  console.log(req.body, "Req.body");
  const entry = new Entry(req.body);
  await entry.save();

  // res.json(entry);
  res.render("posts", { entry: entry.toObject() });
});

module.exports = entryRouter;
