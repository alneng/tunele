import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import { errorHandler } from "./utils/errors.utils";
import { CORS_OPTIONS, PORT } from "./config";
import apiRouter from "./api";

const app = express();

// Middlewares
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors(CORS_OPTIONS));

// Routes
app.use("/api", apiRouter);

// Error handler
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running at http://localhost:${PORT}`);
});
