// @vitest-environment node
import { describe, expect, it } from "vitest";
import { normalizeExtractionPayload } from "./normalize";

describe("normalizeExtractionPayload", () => {
  it("normalizes extracted candidate fields", () => {
    const result = normalizeExtractionPayload({
      candidates: [
        {
          name: " 陈明 ",
          role: "后端工程师",
          source: "猎头",
          stage: "待Offer",
          owner: "Nora",
          interviewTime: "明天 14:00",
          lastContact: "今天",
          risk: "",
          summary: "终面通过，等待薪资确认",
          confidence: 1.2,
        },
      ],
    });

    expect(result.candidates[0]).toMatchObject({
      id: "1-陈明",
      name: "陈明",
      stage: "待Offer",
      confidence: 1,
    });
  });

  it("uses safe defaults when the model omits fields", () => {
    const result = normalizeExtractionPayload({
      candidates: [{ name: "", stage: "未知阶段", confidence: -2 }],
    });

    expect(result.candidates[0]).toMatchObject({
      name: "未识别候选人",
      role: "未识别岗位",
      source: "未识别渠道",
      stage: "初筛",
      owner: "未分配",
      confidence: 0,
    });
  });
});
