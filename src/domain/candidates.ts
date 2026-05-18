import { STAGES, type Candidate, type CandidateInput, type Stage } from "./types";

export const isStage = (value: string | undefined): value is Stage =>
  Boolean(value && (STAGES as readonly string[]).includes(value));

export const stageProgressWeight = (stage: Stage): number => {
  const weights: Record<Stage, number> = {
    初筛: 1,
    沟通中: 2,
    待面试: 3,
    已面试: 4,
    待Offer: 5,
    已入职: 5,
    已淘汰: 2,
  };
  return weights[stage];
};

const cleanText = (value: string | undefined, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

const makeId = (candidate: CandidateInput, index: number) => {
  if (candidate.id?.trim()) {
    return candidate.id.trim();
  }

  const name = cleanText(candidate.name, "candidate");
  return `${index + 1}-${name}`.replace(/\s+/g, "-");
};

export const normalizeCandidate = (candidate: CandidateInput, index = 0): Candidate => ({
  id: makeId(candidate, index),
  name: cleanText(candidate.name, "未识别候选人"),
  role: cleanText(candidate.role, "未识别岗位"),
  source: cleanText(candidate.source, "未识别渠道"),
  stage: isStage(candidate.stage) ? candidate.stage : "初筛",
  owner: cleanText(candidate.owner, "未分配"),
  interviewTime: cleanText(candidate.interviewTime, ""),
  lastContact: cleanText(candidate.lastContact, "未识别"),
  risk: cleanText(candidate.risk, ""),
  summary: cleanText(candidate.summary, "暂无摘要"),
  confidence: Math.min(1, Math.max(0, candidate.confidence ?? 0.5)),
});

const normalizeBusinessKeyPart = (value: string) => value.trim().replace(/\s+/g, " ").toLowerCase();

const getCandidateBusinessKey = (candidate: Candidate) =>
  [candidate.name, candidate.role, candidate.source].map(normalizeBusinessKeyPart).join("|");

export const mergeCandidates = (current: Candidate[], incoming: Candidate[]) => {
  const byKey = new Map<string, Candidate>();

  for (const candidate of current) {
    byKey.set(getCandidateBusinessKey(candidate), candidate);
  }

  for (const candidate of incoming) {
    const key = getCandidateBusinessKey(candidate);
    const existing = byKey.get(key);

    byKey.set(
      key,
      existing
        ? {
            ...candidate,
            id: existing.id,
            stage: existing.stage,
          }
        : candidate,
    );
  }

  return Array.from(byKey.values());
};
