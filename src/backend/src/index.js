const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const apiRouter = require("./api");
const { loadDotenv } = require("./utils/utils");
loadDotenv();

const app = express();
const PORT = process.env.PORT || 7600;

app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors(JSON.parse(process.env.CORS_OPTIONS)));

app.use("/api", apiRouter);

app.get("/monitor", (req, res, next) => {
  return res.status(200).json({ success: "API is up and running" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running at http://localhost:${PORT}`);
});
