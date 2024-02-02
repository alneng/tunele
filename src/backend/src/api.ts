import express from "express";
import authRouter from "./routes/auth.routes";
import customGameRouter from "./routes/custom-game.routes";
import mainGameRouter from "./routes/main-game.routes";
import userRouter from "./routes/user.routes";

const router = express.Router();

router.use("/", mainGameRouter);
router.use("/playlist", customGameRouter);
router.use("/auth", authRouter);
router.use("/user", userRouter);

export default router;
