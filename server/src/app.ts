import cors from "cors";
import express from "express";
import { apiRouter } from "./routes";
import { HttpError } from "./utils/http-error";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use((error: unknown, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (error instanceof SyntaxError && "body" in (error as Record<string, unknown>)) {
    return res.status(400).json({
      success: false,
      message: "Malformed JSON body.",
    });
  }

  return next(error);
});

app.use("/api", apiRouter);

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found.",
  });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";
  return res.status(500).json({
    success: false,
    message,
  });
});
