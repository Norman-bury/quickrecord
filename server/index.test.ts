// @vitest-environment node
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { ExtractionError } from "./errors";
import { createApp } from "./index";

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
});
