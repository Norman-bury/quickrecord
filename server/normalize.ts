import { z } from "zod";
import { normalizeCandidate } from "../src/domain/candidates";
import type { ExtractionResponse } from "../src/domain/types";

const rawCandidateSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  role: z.string().optional(),
  source: z.string().optional(),
  stage: z.string().optional(),
  owner: z.string().optional(),
  interviewTime: z.string().optional(),
  lastContact: z.string().optional(),
  risk: z.string().optional(),
  summary: z.string().optional(),
  confidence: z.number().optional(),
});

const rawPayloadSchema = z.object({
  candidates: z.array(rawCandidateSchema).default([]),
});

export const normalizeExtractionPayload = (payload: unknown): ExtractionResponse => {
  const parsed = rawPayloadSchema.parse(payload);

  return {
    candidates: parsed.candidates.map((candidate, index) => normalizeCandidate(candidate, index)),
  };
};
