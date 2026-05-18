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
});
