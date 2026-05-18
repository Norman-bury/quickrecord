import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { ExtractionError } from "./errors";
import { extractCandidatesWithOpenAI } from "./openaiExtractor";
import type { ExtractionResponse } from "../src/domain/types";

dotenv.config();

type Extractor = (text: string) => Promise<ExtractionResponse>;

type CreateAppOptions = {
  extractor?: Extractor;
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

  return app;
};

const isDirectRun = process.argv[1]?.endsWith("server/index.ts");

if (isDirectRun) {
  const port = Number(process.env.PORT || 8787);
  createApp().listen(port, () => {
    console.log(`Recruiting cockpit API listening on http://localhost:${port}`);
  });
}
