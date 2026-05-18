import OpenAI from "openai";
import { ExtractionError } from "./errors";
import { normalizeExtractionPayload } from "./normalize";
import { extractionJsonSchema } from "./schema";
import type { ExtractionResponse } from "../src/domain/types";

type ResponsesClient = {
  responses: {
    create: (params: Record<string, unknown>) => Promise<{ output_text?: string }>;
  };
};

const SYSTEM_PROMPT = [
  "你是招聘运营数据提取助手。",
  "请从企业微信、微信群或腾讯文档风格的招聘沟通记录中提取候选人记录。",
  "必须输出符合 JSON Schema 的 JSON，不要输出解释。",
  "stage 只能使用：初筛、沟通中、待面试、已面试、待Offer、已入职、已淘汰。",
  "无法识别的字段使用空字符串，confidence 使用 0 到 1 的数字。",
].join("\n");

export const parseOpenAIOutput = (outputText: string | undefined): ExtractionResponse => {
  if (!outputText) {
    throw new ExtractionError("AI 返回为空，请重试。", 502);
  }

  try {
    return normalizeExtractionPayload(JSON.parse(outputText));
  } catch (error) {
    throw new ExtractionError("AI 返回格式异常，请重试或调整输入。", 502, error);
  }
};

export const extractCandidatesWithOpenAI = async (
  text: string,
  injectedClient?: ResponsesClient,
): Promise<ExtractionResponse> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new ExtractionError("未配置 OPENAI_API_KEY，无法调用 OpenAI API。", 500);
  }

  const client = injectedClient ?? new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-5.5";

  const response = await client.responses.create({
    model,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `请提取以下招聘记录，返回 JSON：\n\n${text}` },
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

  return parseOpenAIOutput(response.output_text);
};
