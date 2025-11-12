// index.js
const express = require("express");
const cors = require("cors");
const { randomBytes } = require("crypto");

require("dotenv").config();
const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false })); // for form POSTs
app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// In-memory stores
const users = []; // { username, _id, log: [{ description, duration, date }] }

function makeId() {
  return randomBytes(8).toString("hex");
}

// Create user
app.post("/api/users", (req, res) => {
  const username = req.body.username;
  if (!username) {
    return res.status(400).json({ error: "username required" });
  }

  // If user exists, return existing
  const existing = users.find((u) => u.username === username);
  if (existing) {
    return res.json({ username: existing.username, _id: existing._id });
  }

  const user = { username, _id: makeId(), log: [] };
  users.push(user);
  return res.json({ username: user.username, _id: user._id });
});

// List users
app.get("/api/users", (req, res) => {
  const list = users.map((u) => ({ username: u.username, _id: u._id }));
  res.json(list);
});

// Add exercise
app.post("/api/users/:_id/exercises", (req, res) => {
  const userId = req.params._id;
  const user = users.find((u) => u._id === userId);
  if (!user) return res.status(400).json({ error: "unknown _id" });

  const description = req.body.description;
  const duration = req.body.duration;
  let date = req.body.date;

  if (!description || !duration) {
    return res.status(400).json({ error: "description and duration required" });
  }

  // duration must be a number
  const durationNum = Number(duration);
  if (Number.isNaN(durationNum)) {
    return res.status(400).json({ error: "duration must be a number" });
  }

  // if date not supplied, use current date
  let dateObj;
  if (!date) {
    dateObj = new Date();
  } else {
    dateObj = new Date(date);
    if (dateObj.toString() === "Invalid Date") {
      return res.status(400).json({ error: "invalid date" });
    }
  }

  const entry = {
    description: String(description),
    duration: durationNum,
    date: dateObj.toDateString(),
  };

  user.log.push({
    description: entry.description,
    duration: entry.duration,
    date: entry.date,
  });

  // Response: user object with exercise fields added
  res.json({
    _id: user._id,
    username: user.username,
    date: entry.date,
    duration: entry.duration,
    description: entry.description,
  });
});

// Get logs with optional from, to, limit
app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const user = users.find((u) => u._id === userId);
  if (!user) return res.status(400).json({ error: "unknown _id" });

  let log = user.log.map((e) => ({
    description: e.description,
    duration: e.duration,
    date: e.date,
  }));

  const { from, to, limit } = req.query;

  if (from) {
    const fromD = new Date(from);
    if (fromD.toString() === "Invalid Date") {
      return res.status(400).json({ error: "invalid from date" });
    }
    log = log.filter((e) => new Date(e.date) >= fromD);
  }

  if (to) {
    const toD = new Date(to);
    if (toD.toString() === "Invalid Date") {
      return res.status(400).json({ error: "invalid to date" });
    }
    log = log.filter((e) => new Date(e.date) <= toD);
  }

  if (limit) {
    const lim = Number(limit);
    if (!Number.isInteger(lim) || lim < 1) {
      return res.status(400).json({ error: "invalid limit" });
    }
    log = log.slice(0, lim);
  }

  res.json({
    _id: user._id,
    username: user.username,
    count: log.length,
    log: log,
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Not Found" });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

module.exports = app;
