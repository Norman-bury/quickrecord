// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { ExtractionError } from "./errors";
import { extractCandidatesWithOpenAI, parseOpenAIOutput } from "./openaiExtractor";
import { extractionJsonSchema } from "./schema";

afterEach(() => {
  vi.unstubAllEnvs();
});

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

  it.each([undefined, ""])("throws an extraction error when output_text is empty", (outputText) => {
    expect(() => parseOpenAIOutput(outputText)).toThrow(
      expect.objectContaining({
        statusCode: 502,
        publicMessage: "AI 返回为空，请重试。",
      }),
    );
  });
});

describe("extractCandidatesWithOpenAI", () => {
  it("throws a configuration error when OPENAI_API_KEY is missing", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");

    await expect(extractCandidatesWithOpenAI("候选人 张三")).rejects.toMatchObject({
      statusCode: 500,
      publicMessage: "未配置 OPENAI_API_KEY，无法调用 OpenAI API。",
    });
  });

  it("throws a configuration error when OPENAI_API_KEY is blank", async () => {
    vi.stubEnv("OPENAI_API_KEY", "   ");
    const client = {
      responses: {
        create: vi.fn().mockResolvedValue({
          output_text: JSON.stringify({ candidates: [] }),
        }),
      },
    };

    await expect(extractCandidatesWithOpenAI("候选人 张三", client)).rejects.toMatchObject({
      statusCode: 500,
      publicMessage: "未配置 OPENAI_API_KEY，无法调用 OpenAI API。",
    });
    expect(client.responses.create).not.toHaveBeenCalled();
  });

  it("calls an injected client and parses output_text", async () => {
    vi.stubEnv("OPENAI_API_KEY", "test-key");
    vi.stubEnv("OPENAI_MODEL", "");
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
    expect(client.responses.create).toHaveBeenCalledWith({
      model: "gpt-5.5",
      input: [
        expect.objectContaining({ role: "system" }),
        { role: "user", content: "请提取以下招聘记录，返回 JSON：\n\n李雷 前端 内推 待面试" },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "recruiting_extraction",
          strict: true,
          schema: extractionJsonSchema,
        },
      },
    });
    expect(result.candidates[0]).toMatchObject({ name: "李雷", stage: "待面试" });
  });
});
