import cors from "cors";
import dotenv from "dotenv";
import express, { type ErrorRequestHandler } from "express";
import { ExtractionError } from "./errors";
import { extractCandidatesWithOpenAI } from "./openaiExtractor";
import type { ExtractionResponse } from "../src/domain/types";

dotenv.config();

type Extractor = (text: string) => Promise<ExtractionResponse>;

type CreateAppOptions = {
  extractor?: Extractor;
};

type BodyParserError = Error & {
  status?: number;
  statusCode?: number;
  type?: string;
};

const isBodyParserError = (
  error: unknown,
  type: "entity.parse.failed" | "entity.too.large",
  statusCode: number,
): error is BodyParserError => {
  if (!(error instanceof Error)) {
    return false;
  }

  const bodyParserError = error as BodyParserError;
  return (
    bodyParserError.type === type &&
    (bodyParserError.status === statusCode || bodyParserError.statusCode === statusCode)
  );
};

const apiErrorHandler: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (isBodyParserError(error, "entity.parse.failed", 400)) {
    response.status(400).json({ error: "请求 JSON 格式错误。" });
    return;
  }

  if (isBodyParserError(error, "entity.too.large", 413)) {
    response.status(413).json({ error: "请求内容过大，请控制在 1MB 以内。" });
    return;
  }

  response.status(500).json({ error: "服务暂时不可用，请稍后重试。" });
};

export const createApp = ({ extractor = extractCandidatesWithOpenAI }: CreateAppOptions = {}) => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.post("/api/extract", async (request, response) => {
    const text = typeof request.body?.text === "string" ? request.body.text.trim() : "";

    if (!text) {
      response.status(400).json({ error: "请先输入招聘沟通记录。" });
      return;
    }

    try {
      const result = await extractor(text);
      response.json(result);
    } catch (error) {
      if (error instanceof ExtractionError) {
        response.status(error.statusCode).json({ error: error.publicMessage });
        return;
      }

      response.status(500).json({ error: "AI 提取服务暂时不可用，请稍后重试。" });
    }
  });

  app.use(apiErrorHandler);

  return app;
};

const isDirectRun = process.argv[1]?.endsWith("server/index.ts");

if (isDirectRun) {
  const port = Number(process.env.PORT || 8787);
  createApp().listen(port, () => {
    console.log(`Recruiting cockpit API listening on http://localhost:${port}`);
  });
}
