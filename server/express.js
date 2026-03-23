const express = require("express");
const helmet = require("helmet");
const path = require("path");

const app = express();
const buildPath = path.join(__dirname, "../build");

app.disable("x-powered-by");
app.locals.buildPath = buildPath;
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.static(buildPath));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(express.json({ limit: "10kb" }));

module.exports = app;
