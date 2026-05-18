import { beforeEach, describe, expect, it, vi } from "vitest";
import { extractCandidates } from "./extract";

describe("extractCandidates", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns candidates from a valid success response", async () => {
    const candidates = [
      {
        id: "4-许宁",
        name: "许宁",
        role: "数据分析师",
        source: "官网投递",
        stage: "已入职",
        owner: "Mia",
        interviewTime: "下周一",
        lastContact: "今天",
        risk: "",
        summary: "已经接受 offer，下周一入职",
        confidence: 0.88,
      },
    ];

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ candidates }),
    } as Response);

    await expect(extractCandidates("招聘记录")).resolves.toEqual({ candidates });
  });

  it("throws JSON error payloads returned by the endpoint", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ error: "未配置 OPENAI_API_KEY，无法调用 OpenAI API。" }),
    } as Response);

    await expect(extractCandidates("招聘记录")).rejects.toThrow("未配置 OPENAI_API_KEY，无法调用 OpenAI API。");
  });

  it("uses fallback error for non-JSON endpoint failures", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
    } as unknown as Response);

    await expect(extractCandidates("招聘记录")).rejects.toThrow("AI 提取失败，请稍后重试。");
  });

  it("throws when a successful response has an invalid shape", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ items: [] }),
    } as Response);

    await expect(extractCandidates("招聘记录")).rejects.toThrow("AI 返回数据格式异常，请重试。");
  });

  it("throws when a successful response contains a malformed candidate", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [{}] }),
    } as Response);

    await expect(extractCandidates("招聘记录")).rejects.toThrow("AI 返回数据格式异常，请重试。");
  });
});
