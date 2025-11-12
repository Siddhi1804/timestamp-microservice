// index.js
// where your node app starts

// init project
const express = require('express');
const app = express();

// enable CORS so your API is remotely testable by FCC
const cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// serve static files
app.use(express.static('public'));

// root endpoint
app.get("/", (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// example API endpoint
app.get("/api/hello", (req, res) => {
  res.json({ greeting: 'hello API' });
});

// ------------------- Timestamp Microservice API -------------------
app.get("/api/:date?", (req, res) => {
  let dateString = req.params.date;

  // if no date provided, use current date
  if (!dateString) {
    const now = new Date();
    return res.json({
      unix: now.getTime(),
      utc: now.toUTCString()
    });
  }

  // if dateString is all digits, treat as unix milliseconds
  let date;
  if (/^\d+$/.test(dateString)) {
    date = new Date(parseInt(dateString));
  } else {
    date = new Date(dateString);
  }

  // check for invalid date
  if (date.toString() === "Invalid Date") {
    return res.json({ error: "Invalid Date" });
  }

  // return unix timestamp and UTC string
  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

// ------------------- Start server -------------------
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
