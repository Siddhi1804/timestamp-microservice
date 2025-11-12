require("dotenv").config();
const express = require("express");
const cors = require("cors");
const dns = require("dns");
const { URL } = require("url");
const bodyParser = require("body-parser");

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/public", express.static(${process.cwd()}/public));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

// In-memory store: shortId -> originalUrl
// Replace with a DB for persistence.
const urlStore = new Map();
let nextId = 1;

/**
 * Helper: validate URL format and host existence.
 * Returns Promise that resolves host if valid or rejects with error.
 */
function validateUrlAndHost(input) {
  return new Promise((resolve, reject) => {
    let parsed;
    try {
      parsed = new URL(input);
    } catch (err) {
      return reject(new Error("invalid url"));
    }

    // Only allow http or https
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return reject(new Error("invalid url"));
    }

    // dns.lookup requires hostname without port
    const hostname = parsed.hostname;

    dns.lookup(hostname, (err /*, address */) => {
      if (err) return reject(new Error("invalid url"));
      return resolve(hostname);
    });
  });
}

// POST endpoint to create short url
app.post("/api/shorturl", async (req, res) => {
  const original_url = req.body.url || req.body.original_url || req.body.input;

  if (!original_url) {
    return res.json({ error: "invalid url" });
  }

  try {
    await validateUrlAndHost(original_url);

    // Check if already stored; return existing id if found
    for (const [id, url] of urlStore.entries()) {
      if (url === original_url) {
        return res.json({ original_url, short_url: Number(id) });
      }
    }

    const id = String(nextId++);
    urlStore.set(id, original_url);

    return res.json({ original_url, short_url: Number(id) });
  } catch (err) {
    return res.json({ error: "invalid url" });
  }
});

// Redirect endpoint
app.get("/api/shorturl/:id", (req, res) => {
  const id = String(req.params.id);
  const original = urlStore.get(id);
  if (!original)
    return res
      .status(404)
      .json({ error: "No short URL found for given input" });
  return res.redirect(original);
});

// simple test endpoint
app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

app.listen(port, () => {
  console.log(Listening on port ${port});
});
