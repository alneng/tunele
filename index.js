const express = require("express");
const app = express();

const API = require("./api");

app.use(express.static("static"));

app.use("/api", API);

app.get("/monitor", (req, res) => {
    return res.status(200).json({ success: "API is up and running" });
});

module.exports = app;
