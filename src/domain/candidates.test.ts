import { describe, expect, it } from "vitest";
import { mergeCandidates } from "./candidates";
import type { Candidate } from "./types";

const candidate = (overrides: Partial<Candidate> = {}): Candidate => ({
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
  ...overrides,
});

describe("mergeCandidates", () => {
  it("updates a reordered candidate with the same business key without changing the existing ID", () => {
    const current = candidate({
      id: "local-candidate-id",
      summary: "旧摘要",
      confidence: 0.7,
    });
    const incoming = candidate({
      id: "2-林悦",
      summary: "新一轮提取摘要",
      risk: "薪资风险",
      confidence: 0.95,
    });

    const merged = mergeCandidates([current], [incoming]);

    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({
      id: "local-candidate-id",
      summary: "新一轮提取摘要",
      risk: "薪资风险",
      confidence: 0.95,
    });
  });

  it("keeps a locally edited stage when the incoming candidate has the same business key", () => {
    const current = candidate({
      id: "local-candidate-id",
      stage: "已面试",
      summary: "面试已完成",
    });
    const incoming = candidate({
      id: "1-林悦",
      stage: "待面试",
      summary: "AI 提取仍标记为待面试",
    });

    const merged = mergeCandidates([current], [incoming]);

    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({
      id: "local-candidate-id",
      stage: "已面试",
      summary: "AI 提取仍标记为待面试",
    });
  });

  it("appends a new candidate with a different business key", () => {
    const current = candidate({ id: "local-candidate-id" });
    const incoming = candidate({
      id: "2-周然",
      name: "周然",
      role: "产品经理",
      source: "Boss直聘",
    });

    const merged = mergeCandidates([current], [incoming]);

    expect(merged).toHaveLength(2);
    expect(merged.map((item) => item.id)).toEqual(["local-candidate-id", "2-周然"]);
  });
});
