const express = require("express");
const authRouter = require("./routes/auth.routes");
const customGameRouter = require("./routes/custom-game.routes");
const mainGameRouter = require("./routes/main-game.routes");
const userRouter = require("./routes/user.routes");

const router = express.Router();

router.use("/", mainGameRouter);
router.use("/playlist", customGameRouter);
router.use("/auth", authRouter);
router.use("/user", userRouter);

module.exports = router;
