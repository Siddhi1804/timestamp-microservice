// index.js
const express = require('express');
const cors = require('cors');
const app = express();

// enable CORS so your API is remotely testable by FCC
app.use(cors({ optionsSuccessStatus: 200 }));

// serve static files
app.use(express.static('public'));

// root endpoint
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// example API endpoint
app.get('/api/hello', (req, res) => {
  res.json({ greeting: 'hello API' });
});

// ------------------- Request Header Parser -------------------
app.get('/api/whoami', (req, res) => {
  // IP address
  const ipaddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // language
  const language = req.headers['accept-language'];

  // software (user-agent)
  const software = req.headers['user-agent'];

  res.json({
    ipaddress: ipaddress,
    language: language,
    software: software
  });
});

// ------------------- Start server -------------------
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
