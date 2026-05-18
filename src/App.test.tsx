import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the management cockpit with sample candidates", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "招聘提效管理驾驶舱" })).toBeInTheDocument();
    expect(screen.getByText("AI 提取")).toBeInTheDocument();
    expect(screen.getByText("候选人流水")).toBeInTheDocument();
    expect(screen.getByText("林悦")).toBeInTheDocument();
  });

  it("updates metrics when a candidate stage changes", async () => {
    const user = userEvent.setup();
    render(<App />);

    expect(screen.getByTestId("risk-count")).toHaveTextContent("2");

    await user.selectOptions(screen.getByLabelText("林悦阶段"), "已面试");

    expect(screen.getByTestId("conversion-rate")).toHaveTextContent("67%");
  });

  it("shows API errors returned by extraction endpoint", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ error: "未配置 OPENAI_API_KEY，无法调用 OpenAI API。" }),
    } as Response);

    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "AI 提取" }));

    await waitFor(() => {
      expect(screen.getByText("未配置 OPENAI_API_KEY，无法调用 OpenAI API。")).toBeInTheDocument();
    });
  });

  it("merges successfully extracted candidates and shows a status message", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        candidates: [
          {
            id: "4-许宁",
            name: "许宁",
            role: "数据分析师",
            source: "官网投递",
            stage: "已入职",
            owner: "Mia",
            interviewTime: "下周一",
            lastContact: "今天",
            risk: "",
            summary: "已经接受 offer，下周一入职",
            confidence: 0.88,
          },
        ],
      }),
    } as Response);

    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "AI 提取" }));

    expect(await screen.findByText("许宁")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("AI 已提取 1 条候选人记录，并同步刷新看板。");
  });
});
