import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { apiRouter } from "./routes";
import { HttpError } from "./utils/http-error";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// Serve frontend static files
const distPath = path.resolve(__dirname, "../../dist");
app.use(express.static(distPath));

// SPA catch-all: route all non-API requests to index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
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
