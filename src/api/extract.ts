import { STAGES, type Candidate, type ExtractionResponse } from "../domain/types";

const FALLBACK_ERROR_MESSAGE = "AI 提取失败，请稍后重试。";
const INVALID_RESPONSE_MESSAGE = "AI 返回数据格式异常，请重试。";
const REQUIRED_STRING_FIELDS = [
  "id",
  "name",
  "role",
  "source",
  "stage",
  "owner",
  "interviewTime",
  "lastContact",
  "risk",
  "summary",
] as const;

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
};

const isCandidate = (value: unknown): value is Candidate => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    REQUIRED_STRING_FIELDS.every((field) => typeof candidate[field] === "string") &&
    (STAGES as readonly string[]).includes(candidate.stage as string) &&
    typeof candidate.confidence === "number"
  );
};

export const extractCandidates = async (text: string): Promise<ExtractionResponse> => {
  let response: Response;

  try {
    response = await fetch("/api/extract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
  } catch {
    throw new Error(FALLBACK_ERROR_MESSAGE);
  }

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

  if (!payload.candidates.every(isCandidate)) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  return { candidates: payload.candidates };
};
