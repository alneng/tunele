import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors";
import apiRouter from "./api";
import { errorHandler } from "./utils/errors.utils";
import { loadDotenv } from "./utils/utils";
loadDotenv();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 7600;

app.use(bodyParser.json());
app.use(cookieParser());

app.use(cors(JSON.parse(process.env.CORS_OPTIONS)));

app.use("/api", apiRouter);

app.get("/monitor", (_req: Request, res: Response, _next: NextFunction) => {
  return res.status(200).json({ success: "API is up and running" });
});

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API running at http://localhost:${PORT}`);
});
