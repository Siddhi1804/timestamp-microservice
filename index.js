// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));
app.use(express.static("public"));

// root route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// test route
app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

// ✅ Request Header Parser API endpoint
app.get("/api/whoami", (req, res) => {
  // Use x-forwarded-for or fall back to request socket
  const ipaddress = req.headers["x-forwarded-for"]
    ? req.headers["x-forwarded-for"].split(",")[0]
    : req.socket.remoteAddress;

  const language = req.headers["accept-language"];
  const software = req.headers["user-agent"];

  res.json({
    ipaddress,
    language,
    software,
  });
});

// start server
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
