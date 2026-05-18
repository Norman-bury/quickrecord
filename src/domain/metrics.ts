import { stageProgressWeight } from "./candidates";
import { STAGES, type Candidate, type ChannelStat, type FunnelItem, type OverviewMetrics } from "./types";

const INTERVIEWED_STAGES = new Set(["已面试", "待Offer", "已入职"]);

const percent = (part: number, total: number) => (total === 0 ? 0 : Math.round((part / total) * 100));

export const calculateOverview = (candidates: Candidate[]): OverviewMetrics => {
  const totalCandidates = candidates.length;
  const activeRoles = new Set(candidates.map((candidate) => candidate.role)).size;
  const interviewed = candidates.filter((candidate) => INTERVIEWED_STAGES.has(candidate.stage)).length;
  const riskCount = candidates.filter((candidate) => candidate.risk.trim().length > 0).length;
  const savedHours = Number((totalCandidates * 0.1).toFixed(1));
  const progressSum = candidates.reduce((sum, candidate) => sum + stageProgressWeight(candidate.stage), 0);

  return {
    totalCandidates,
    activeRoles,
    interviewConversionRate: percent(interviewed, totalCandidates),
    riskCount,
    savedHours,
    averageProgressDays: totalCandidates === 0 ? 0 : Math.round(progressSum / totalCandidates),
  };
};

export const calculateFunnel = (candidates: Candidate[]): FunnelItem[] =>
  STAGES.map((stage) => ({
    stage,
    count: candidates.filter((candidate) => candidate.stage === stage).length,
  }));

export const calculateChannelStats = (candidates: Candidate[]): ChannelStat[] => {
  const sources = Array.from(new Set(candidates.map((candidate) => candidate.source))).sort();

  return sources.map((source) => {
    const sourceCandidates = candidates.filter((candidate) => candidate.source === source);
    const interviewed = sourceCandidates.filter((candidate) => INTERVIEWED_STAGES.has(candidate.stage)).length;
    const hired = sourceCandidates.filter((candidate) => candidate.stage === "已入职").length;

    return {
      source,
      total: sourceCandidates.length,
      interviewed,
      hired,
      conversionRate: percent(interviewed, sourceCandidates.length),
    };
  });
};

export const getRiskCandidates = (candidates: Candidate[]) =>
  candidates.filter((candidate) => candidate.risk.trim().length > 0);
