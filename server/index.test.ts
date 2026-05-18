// @vitest-environment node
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { ExtractionError } from "./errors";
import { createApp } from "./index";

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const response = await request(createApp()).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it.each(["http://localhost:5173", "http://127.0.0.1:5173"])("allows the local Vite origin %s", async (origin) => {
    const response = await request(createApp()).get("/api/health").set("Origin", origin);

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe(origin);
    expect(response.body).toEqual({ ok: true });
  });

  it("rejects non-local browser origins with a public JSON error", async () => {
    const response = await request(createApp()).get("/api/health").set("Origin", "https://example.com");

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "不允许的请求来源。" });
  });
});

describe("POST /api/extract", () => {
  it("rejects empty text", async () => {
    const app = createApp();

    const response = await request(app).post("/api/extract").send({ text: "" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("请先输入招聘沟通记录。");
  });

  it("returns candidates from the injected extractor", async () => {
    const extractor = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: "1-王磊",
          name: "王磊",
          role: "销售经理",
          source: "猎头",
          stage: "沟通中",
          owner: "Ivy",
          interviewTime: "",
          lastContact: "今天",
          risk: "薪资风险",
          summary: "候选人薪资期望偏高",
          confidence: 0.8,
        },
      ],
    });

    const response = await request(createApp({ extractor })).post("/api/extract").send({ text: "王磊 销售经理" });

    expect(response.status).toBe(200);
    expect(response.body.candidates[0].name).toBe("王磊");
    expect(extractor).toHaveBeenCalledWith("王磊 销售经理");
  });

  it("returns public extraction errors", async () => {
    const extractor = vi.fn().mockRejectedValue(new ExtractionError("未配置 OPENAI_API_KEY，无法调用 OpenAI API。", 500));

    const response = await request(createApp({ extractor })).post("/api/extract").send({ text: "候选人" });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("未配置 OPENAI_API_KEY，无法调用 OpenAI API。");
  });

  it("returns a public JSON error for malformed JSON", async () => {
    const response = await request(createApp())
      .post("/api/extract")
      .set("Content-Type", "application/json")
      .send("{");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: "请求 JSON 格式错误。" });
  });

  it("returns a public JSON error when the payload is over 1MB", async () => {
    const response = await request(createApp())
      .post("/api/extract")
      .send({ text: "候选人".repeat(600_000) });

    expect(response.status).toBe(413);
    expect(response.body).toEqual({ error: "请求内容过大，请控制在 1MB 以内。" });
  });

  it("does not leak generic extractor errors", async () => {
    const extractor = vi.fn().mockRejectedValue(new Error("upstream secret stack detail"));

    const response = await request(createApp({ extractor })).post("/api/extract").send({ text: "候选人" });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("AI 提取服务暂时不可用，请稍后重试。");
    expect(response.body.error).not.toContain("upstream secret");
  });
});
