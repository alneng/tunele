const express = require("express");
const app = express();

const API = require("./api");

app.use(express.static("static"));

app.use("/api", API);

module.exports = app;
