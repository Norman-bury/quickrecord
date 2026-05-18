import type { ExtractionResponse } from "../domain/types";

export const extractCandidates = async (text: string): Promise<ExtractionResponse> => {
  const response = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "AI 提取失败，请稍后重试。");
  }

  return payload as ExtractionResponse;
};
