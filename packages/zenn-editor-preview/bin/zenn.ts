#!/usr/bin/env node

export const wip = {}; // TODO
const srcDir = `${__dirname}/../../.`; // refer src from src/dist/bin/zenn.js

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

// always production
// const dev = process.env.NODE_ENV !== "production";
const dev = false;

const app = next({ dev, dir: srcDir });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    // Be sure to pass `true` as the second argument to `url.parse`.
    // This tells it to parse the query portion of the URL.
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log("> Ready on http://localhost:3000");
  });
});
