import { beforeEach, describe, expect, it, vi } from "vitest";
import { extractCandidates } from "./extract";

describe("extractCandidates", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
});
