const express = require("express");
const app = express();
const path = require("path");

const API = require("./api");

app.use(express.static("static"));

app.use("/api", API);

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "templates", "index.html"));
});

module.exports = app;
