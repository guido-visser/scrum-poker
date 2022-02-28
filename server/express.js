const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
let app = express();
app.use(express.static(path.join(__dirname, "../build")));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "../build/index.html"));
});

module.exports = app;
