// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { ExtractionError } from "./errors";
import { extractCandidatesWithOpenAI, parseOpenAIOutput } from "./openaiExtractor";

describe("parseOpenAIOutput", () => {
  it("parses and normalizes JSON output_text", () => {
    const result = parseOpenAIOutput(
      JSON.stringify({
        candidates: [
          {
            name: "赵敏",
            role: "数据分析师",
            source: "官网投递",
            stage: "已面试",
            owner: "Kai",
            interviewTime: "周五 11:00",
            lastContact: "今天",
            risk: "待反馈",
            summary: "业务面结束，等待用人经理反馈",
            confidence: 0.77,
          },
        ],
      }),
    );

    expect(result.candidates[0].name).toBe("赵敏");
    expect(result.candidates[0].risk).toBe("待反馈");
  });

  it("throws an extraction error for invalid JSON", () => {
    expect(() => parseOpenAIOutput("not-json")).toThrow(ExtractionError);
  });
});

describe("extractCandidatesWithOpenAI", () => {
  it("throws a configuration error when OPENAI_API_KEY is missing", async () => {
    const original = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    await expect(extractCandidatesWithOpenAI("候选人 张三")).rejects.toMatchObject({
      statusCode: 500,
      publicMessage: "未配置 OPENAI_API_KEY，无法调用 OpenAI API。",
    });

    process.env.OPENAI_API_KEY = original;
  });

  it("calls an injected client and parses output_text", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const client = {
      responses: {
        create: vi.fn().mockResolvedValue({
          output_text: JSON.stringify({
            candidates: [
              {
                name: "李雷",
                role: "前端工程师",
                source: "内推",
                stage: "待面试",
                owner: "Amy",
                interviewTime: "周三 16:00",
                lastContact: "今天",
                risk: "",
                summary: "约定技术面",
                confidence: 0.9,
              },
            ],
          }),
        }),
      },
    };

    const result = await extractCandidatesWithOpenAI("李雷 前端 内推 待面试", client);

    expect(client.responses.create).toHaveBeenCalledOnce();
    expect(result.candidates[0]).toMatchObject({ name: "李雷", stage: "待面试" });
  });
});
