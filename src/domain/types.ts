export const STAGES = ["初筛", "沟通中", "待面试", "已面试", "待Offer", "已入职", "已淘汰"] as const;

export type Stage = (typeof STAGES)[number];

export type Candidate = {
  id: string;
  name: string;
  role: string;
  source: string;
  stage: Stage;
  owner: string;
  interviewTime: string;
  lastContact: string;
  risk: string;
  summary: string;
  confidence: number;
};

export type CandidateInput = Partial<Omit<Candidate, "id" | "stage" | "confidence">> & {
  id?: string;
  stage?: string;
  confidence?: number;
};

export type ExtractionResponse = {
  candidates: Candidate[];
};

export type OverviewMetrics = {
  totalCandidates: number;
  activeRoles: number;
  interviewConversionRate: number;
  riskCount: number;
  savedHours: number;
  averageProgressDays: number;
};

export type FunnelItem = {
  stage: Stage;
  count: number;
};

export type ChannelStat = {
  source: string;
  total: number;
  interviewed: number;
  hired: number;
  conversionRate: number;
};
