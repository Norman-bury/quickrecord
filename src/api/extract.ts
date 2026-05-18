import type { ExtractionResponse } from "../domain/types";

const FALLBACK_ERROR_MESSAGE = "AI 提取失败，请稍后重试。";
const INVALID_RESPONSE_MESSAGE = "AI 返回数据格式异常，请重试。";

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
};

export const extractCandidates = async (text: string): Promise<ExtractionResponse> => {
  const response = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const payload = await readJson(response);

  if (!response.ok) {
    const error = typeof payload === "object" && payload !== null && "error" in payload ? payload.error : undefined;
    throw new Error(typeof error === "string" ? error : FALLBACK_ERROR_MESSAGE);
  }

  if (
    typeof payload !== "object" ||
    payload === null ||
    !("candidates" in payload) ||
    !Array.isArray(payload.candidates)
  ) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return payload as ExtractionResponse;
};
