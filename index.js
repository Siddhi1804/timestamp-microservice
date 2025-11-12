// index.js
// where your node app starts

// init project
var express = require("express");
var cors = require("cors");
var app = express();

// enable CORS for FCC testing
app.use(cors({ optionsSuccessStatus: 200 }));

// serve static files
app.use(express.static("public"));

// serve index page
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

// your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

// ---------- Timestamp Microservice ----------
app.get("/api/:date?", (req, res) => {
  let dateInput = req.params.date;

  let date;
  // If no date is provided, use current time
  if (!dateInput) {
    date = new Date();
  } else {
    // If input is a number (Unix timestamp)
    if (!isNaN(dateInput)) {
      date = new Date(parseInt(dateInput));
    } else {
      // Otherwise, treat it as a date string
      date = new Date(dateInput);
    }
  }

  // Check if the date is valid
  if (date.toString() === "Invalid Date") {
    return res.json({ error: "Invalid Date" });
  }

  // Return response in required format
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString(),
  });
});

// ---------- Start server ----------
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
