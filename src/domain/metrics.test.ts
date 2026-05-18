import { describe, expect, it } from "vitest";
import type { Candidate } from "./types";
import {
  calculateChannelStats,
  calculateFunnel,
  calculateOverview,
  getRiskCandidates,
} from "./metrics";

const candidates: Candidate[] = [
  {
    id: "c-1",
    name: "林悦",
    role: "前端工程师",
    source: "内推",
    stage: "待面试",
    owner: "Mia",
    interviewTime: "周三 15:00",
    lastContact: "今天",
    risk: "",
    summary: "已通过初筛，等待技术面",
    confidence: 0.92,
  },
  {
    id: "c-2",
    name: "周然",
    role: "产品经理",
    source: "Boss直聘",
    stage: "已面试",
    owner: "Leo",
    interviewTime: "昨天 10:00",
    lastContact: "昨天",
    risk: "待反馈",
    summary: "业务面完成，等待反馈",
    confidence: 0.81,
  },
  {
    id: "c-3",
    name: "许宁",
    role: "前端工程师",
    source: "Boss直聘",
    stage: "已入职",
    owner: "Mia",
    interviewTime: "上周五",
    lastContact: "今天",
    risk: "",
    summary: "Offer 已接受",
    confidence: 0.88,
  },
];

describe("dashboard metrics", () => {
  it("calculates overview metrics for management", () => {
    expect(calculateOverview(candidates)).toEqual({
      totalCandidates: 3,
      activeRoles: 2,
      interviewConversionRate: 67,
      riskCount: 1,
      savedHours: 0.3,
      averageProgressDays: 4,
    });
  });

  it("counts candidates in every stage", () => {
    expect(calculateFunnel(candidates)).toEqual([
      { stage: "初筛", count: 0 },
      { stage: "沟通中", count: 0 },
      { stage: "待面试", count: 1 },
      { stage: "已面试", count: 1 },
      { stage: "待Offer", count: 0 },
      { stage: "已入职", count: 1 },
      { stage: "已淘汰", count: 0 },
    ]);
  });

  it("calculates channel conversion", () => {
    expect(calculateChannelStats(candidates)).toEqual([
      {
        source: "Boss直聘",
        total: 2,
        interviewed: 2,
        hired: 1,
        conversionRate: 100,
      },
      {
        source: "内推",
        total: 1,
        interviewed: 0,
        hired: 0,
        conversionRate: 0,
      },
    ]);
  });

  it("returns only candidates with a risk tag", () => {
    expect(getRiskCandidates(candidates).map((item) => item.name)).toEqual(["周然"]);
  });
});
