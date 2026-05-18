# Recruiting Cockpit Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a runnable single-page recruiting management cockpit demo that uses a Node/Express backend to call the OpenAI Responses API and structure pasted Chinese recruiting messages into candidate records.

**Architecture:** The app is a Vite React TypeScript frontend backed by an Express API. Domain logic for candidate normalization and dashboard metrics is pure TypeScript and tested independently; the server wraps OpenAI extraction behind a small service and exposes `POST /api/extract`.

**Tech Stack:** Vite, React, TypeScript, Express, OpenAI Node SDK, Zod, Vitest, React Testing Library, Supertest, lucide-react.

---

## File Structure

- Create `package.json`: scripts, dependencies, dev dependencies.
- Create `.gitignore`: ignore dependencies, build output, environment files, coverage.
- Create `index.html`: Vite mount point.
- Create `vite.config.ts`: React plugin, Vitest config, `/api` proxy to Express.
- Create `tsconfig.json`: shared TS compiler settings.
- Create `src/main.tsx`: React entrypoint.
- Create `src/App.tsx`: single-page cockpit UI and interactions.
- Create `src/styles.css`: restrained management dashboard styling.
- Create `src/data/sample.ts`: Chinese demo chat log and initial candidate records.
- Create `src/domain/types.ts`: candidate, stage, metrics, extraction response types.
- Create `src/domain/candidates.ts`: candidate normalization and stage helpers.
- Create `src/domain/metrics.ts`: overview, funnel, channel, and risk calculations.
- Create `src/api/extract.ts`: frontend API client for `POST /api/extract`.
- Create `src/setupTests.ts`: React Testing Library matchers.
- Create `src/domain/metrics.test.ts`: domain metric tests.
- Create `src/App.test.tsx`: UI smoke and interaction tests.
- Create `server/errors.ts`: typed API errors.
- Create `server/schema.ts`: OpenAI Structured Outputs JSON schema.
- Create `server/normalize.ts`: server-side extraction normalization using shared domain helpers.
- Create `server/openaiExtractor.ts`: OpenAI Responses API integration.
- Create `server/index.ts`: Express app factory and server startup.
- Create `server/normalize.test.ts`: server normalization tests.
- Create `server/openaiExtractor.test.ts`: missing key and output parsing tests.
- Create `server/index.test.ts`: API route tests with injected extractor.
- Create `README.md`: setup, environment, startup, demo script, test commands.

OpenAI implementation note: use the Responses API with `text.format` JSON schema structured outputs and read `response.output_text`, matching current official docs.

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `.gitignore`
- Create: `index.html`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `src/setupTests.ts`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "quickrecord-recruiting-cockpit",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "client": "vite --host 0.0.0.0",
    "server": "tsx server/index.ts",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit",
    "build": "vite build"
  },
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.19.2",
    "lucide-react": "^0.468.0",
    "openai": "latest",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@testing-library/user-event": "^14.5.2",
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/node": "^22.10.2",
    "@types/react": "^18.3.16",
    "@types/react-dom": "^18.3.5",
    "@types/supertest": "^6.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "concurrently": "^9.1.0",
    "jsdom": "^25.0.1",
    "supertest": "^7.0.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.2",
    "vite": "^6.0.3",
    "vitest": "^2.1.8"
  }
}
```

- [ ] **Step 2: Create `.gitignore`**

```gitignore
node_modules
dist
coverage
.env
.env.*
!.env.example
.DS_Store
*.log
```

- [ ] **Step 3: Create `index.html`**

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>招聘提效管理驾驶舱</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "server", "vite.config.ts"]
}
```

- [ ] **Step 5: Create `vite.config.ts`**

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8787",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/setupTests.ts",
  },
});
```

- [ ] **Step 6: Create `src/setupTests.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 7: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and the command exits with code 0.

- [ ] **Step 8: Run initial verification**

Run: `npm run typecheck`

Expected: TypeScript reports no source inputs or no compile errors after files exist. If TypeScript reports no inputs before `src` exists, continue to Task 2 and rerun after `src` files are created.

- [ ] **Step 9: Commit scaffold**

```bash
git add package.json package-lock.json .gitignore index.html vite.config.ts tsconfig.json src/setupTests.ts
git commit -m "chore: scaffold recruiting cockpit app"
```

---

## Task 2: Candidate Domain and Metrics

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/candidates.ts`
- Create: `src/domain/metrics.ts`
- Create: `src/domain/metrics.test.ts`

- [ ] **Step 1: Write failing tests in `src/domain/metrics.test.ts`**

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- src/domain/metrics.test.ts`

Expected: FAIL because `src/domain/types.ts` and `src/domain/metrics.ts` do not exist.

- [ ] **Step 3: Create `src/domain/types.ts`**

```ts
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
```

- [ ] **Step 4: Create `src/domain/candidates.ts`**

```ts
import { STAGES, type Candidate, type CandidateInput, type Stage } from "./types";

export const isStage = (value: string | undefined): value is Stage =>
  Boolean(value && (STAGES as readonly string[]).includes(value));

export const stageProgressWeight = (stage: Stage): number => {
  const weights: Record<Stage, number> = {
    初筛: 1,
    沟通中: 2,
    待面试: 3,
    已面试: 5,
    待Offer: 7,
    已入职: 10,
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

export const mergeCandidates = (current: Candidate[], incoming: Candidate[]) => {
  const byKey = new Map<string, Candidate>();

  for (const candidate of current) {
    byKey.set(candidate.id, candidate);
  }

  for (const candidate of incoming) {
    byKey.set(candidate.id, candidate);
  }

  return Array.from(byKey.values());
};
```

- [ ] **Step 5: Create `src/domain/metrics.ts`**

```ts
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
  const sources = Array.from(new Set(candidates.map((candidate) => candidate.source))).sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  );

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
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm test -- src/domain/metrics.test.ts`

Expected: PASS for 4 tests.

- [ ] **Step 7: Commit domain logic**

```bash
git add src/domain/types.ts src/domain/candidates.ts src/domain/metrics.ts src/domain/metrics.test.ts
git commit -m "feat: add recruiting dashboard domain metrics"
```

---

## Task 3: Server Normalization and OpenAI Extractor

**Files:**
- Create: `server/errors.ts`
- Create: `server/schema.ts`
- Create: `server/normalize.ts`
- Create: `server/openaiExtractor.ts`
- Create: `server/normalize.test.ts`
- Create: `server/openaiExtractor.test.ts`

- [ ] **Step 1: Write failing normalization tests in `server/normalize.test.ts`**

```ts
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
```

- [ ] **Step 2: Write failing extractor tests in `server/openaiExtractor.test.ts`**

```ts
// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { ExtractionError } from "./errors";
import { extractCandidatesWithOpenAI, parseOpenAIOutput } from "./openaiExtractor";

describe("parseOpenAIOutput", () => {
  it("parses and normalizes JSON output_text", () => {
    const result = parseOpenAIOutput(
      JSON.stringify({
        candidates: [
          {
            name: "赵敏",
            role: "数据分析师",
            source: "官网投递",
            stage: "已面试",
            owner: "Kai",
            interviewTime: "周五 11:00",
            lastContact: "今天",
            risk: "待反馈",
            summary: "业务面结束，等待用人经理反馈",
            confidence: 0.77,
          },
        ],
      }),
    );

    expect(result.candidates[0].name).toBe("赵敏");
    expect(result.candidates[0].risk).toBe("待反馈");
  });

  it("throws an extraction error for invalid JSON", () => {
    expect(() => parseOpenAIOutput("not-json")).toThrow(ExtractionError);
  });
});

describe("extractCandidatesWithOpenAI", () => {
  it("throws a configuration error when OPENAI_API_KEY is missing", async () => {
    const original = process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_API_KEY;

    await expect(extractCandidatesWithOpenAI("候选人 张三")).rejects.toMatchObject({
      statusCode: 500,
      publicMessage: "未配置 OPENAI_API_KEY，无法调用 OpenAI API。",
    });

    process.env.OPENAI_API_KEY = original;
  });

  it("calls an injected client and parses output_text", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    const client = {
      responses: {
        create: vi.fn().mockResolvedValue({
          output_text: JSON.stringify({
            candidates: [
              {
                name: "李雷",
                role: "前端工程师",
                source: "内推",
                stage: "待面试",
                owner: "Amy",
                interviewTime: "周三 16:00",
                lastContact: "今天",
                risk: "",
                summary: "约定技术面",
                confidence: 0.9,
              },
            ],
          }),
        }),
      },
    };

    const result = await extractCandidatesWithOpenAI("李雷 前端 内推 待面试", client);

    expect(client.responses.create).toHaveBeenCalledOnce();
    expect(result.candidates[0]).toMatchObject({ name: "李雷", stage: "待面试" });
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npm test -- server/normalize.test.ts server/openaiExtractor.test.ts`

Expected: FAIL because server modules do not exist.

- [ ] **Step 4: Create `server/errors.ts`**

```ts
export class ExtractionError extends Error {
  statusCode: number;
  publicMessage: string;

  constructor(publicMessage: string, statusCode = 500, cause?: unknown) {
    super(publicMessage);
    this.name = "ExtractionError";
    this.statusCode = statusCode;
    this.publicMessage = publicMessage;
    this.cause = cause;
  }
}
```

- [ ] **Step 5: Create `server/schema.ts`**

```ts
export const extractionJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    candidates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          role: { type: "string" },
          source: { type: "string" },
          stage: {
            type: "string",
            enum: ["初筛", "沟通中", "待面试", "已面试", "待Offer", "已入职", "已淘汰"],
          },
          owner: { type: "string" },
          interviewTime: { type: "string" },
          lastContact: { type: "string" },
          risk: { type: "string" },
          summary: { type: "string" },
          confidence: { type: "number" },
        },
        required: [
          "name",
          "role",
          "source",
          "stage",
          "owner",
          "interviewTime",
          "lastContact",
          "risk",
          "summary",
          "confidence",
        ],
      },
    },
  },
  required: ["candidates"],
} as const;
```

- [ ] **Step 6: Create `server/normalize.ts`**

```ts
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
```

- [ ] **Step 7: Create `server/openaiExtractor.ts`**

```ts
import OpenAI from "openai";
import { ExtractionError } from "./errors";
import { normalizeExtractionPayload } from "./normalize";
import { extractionJsonSchema } from "./schema";
import type { ExtractionResponse } from "../src/domain/types";

type ResponsesClient = {
  responses: {
    create: (params: Record<string, unknown>) => Promise<{ output_text?: string }>;
  };
};

const SYSTEM_PROMPT = [
  "你是招聘运营数据提取助手。",
  "请从企业微信、微信群或腾讯文档风格的招聘沟通记录中提取候选人记录。",
  "必须输出符合 JSON Schema 的 JSON，不要输出解释。",
  "stage 只能使用：初筛、沟通中、待面试、已面试、待Offer、已入职、已淘汰。",
  "无法识别的字段使用空字符串，confidence 使用 0 到 1 的数字。",
].join("\n");

export const parseOpenAIOutput = (outputText: string | undefined): ExtractionResponse => {
  if (!outputText) {
    throw new ExtractionError("AI 返回为空，请重试。", 502);
  }

  try {
    return normalizeExtractionPayload(JSON.parse(outputText));
  } catch (error) {
    throw new ExtractionError("AI 返回格式异常，请重试或调整输入。", 502, error);
  }
};

export const extractCandidatesWithOpenAI = async (
  text: string,
  injectedClient?: ResponsesClient,
): Promise<ExtractionResponse> => {
  if (!process.env.OPENAI_API_KEY) {
    throw new ExtractionError("未配置 OPENAI_API_KEY，无法调用 OpenAI API。", 500);
  }

  const client = injectedClient ?? new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-5.5";

  const response = await client.responses.create({
    model,
    input: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `请提取以下招聘记录，返回 JSON：\n\n${text}` },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "recruiting_extraction",
        strict: true,
        schema: extractionJsonSchema,
      },
    },
  });

  return parseOpenAIOutput(response.output_text);
};
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm test -- server/normalize.test.ts server/openaiExtractor.test.ts`

Expected: PASS for 5 tests.

- [ ] **Step 9: Commit extractor service**

```bash
git add server/errors.ts server/schema.ts server/normalize.ts server/openaiExtractor.ts server/normalize.test.ts server/openaiExtractor.test.ts
git commit -m "feat: add OpenAI recruiting extractor service"
```

---

## Task 4: Express API

**Files:**
- Create: `server/index.ts`
- Create: `server/index.test.ts`

- [ ] **Step 1: Write failing API tests in `server/index.test.ts`**

```ts
// @vitest-environment node
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { ExtractionError } from "./errors";
import { createApp } from "./index";

describe("POST /api/extract", () => {
  it("rejects empty text", async () => {
    const app = createApp();

    const response = await request(app).post("/api/extract").send({ text: "" });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("请先输入招聘沟通记录。");
  });

  it("returns candidates from the injected extractor", async () => {
    const extractor = vi.fn().mockResolvedValue({
      candidates: [
        {
          id: "1-王磊",
          name: "王磊",
          role: "销售经理",
          source: "猎头",
          stage: "沟通中",
          owner: "Ivy",
          interviewTime: "",
          lastContact: "今天",
          risk: "薪资风险",
          summary: "候选人薪资期望偏高",
          confidence: 0.8,
        },
      ],
    });

    const response = await request(createApp({ extractor })).post("/api/extract").send({ text: "王磊 销售经理" });

    expect(response.status).toBe(200);
    expect(response.body.candidates[0].name).toBe("王磊");
    expect(extractor).toHaveBeenCalledWith("王磊 销售经理");
  });

  it("returns public extraction errors", async () => {
    const extractor = vi.fn().mockRejectedValue(new ExtractionError("未配置 OPENAI_API_KEY，无法调用 OpenAI API。", 500));

    const response = await request(createApp({ extractor })).post("/api/extract").send({ text: "候选人" });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("未配置 OPENAI_API_KEY，无法调用 OpenAI API。");
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test -- server/index.test.ts`

Expected: FAIL because `server/index.ts` does not exist.

- [ ] **Step 3: Create `server/index.ts`**

```ts
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { ExtractionError } from "./errors";
import { extractCandidatesWithOpenAI } from "./openaiExtractor";
import type { ExtractionResponse } from "../src/domain/types";

dotenv.config();

type Extractor = (text: string) => Promise<ExtractionResponse>;

type CreateAppOptions = {
  extractor?: Extractor;
};

export const createApp = ({ extractor = extractCandidatesWithOpenAI }: CreateAppOptions = {}) => {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/api/health", (_request, response) => {
    response.json({ ok: true });
  });

  app.post("/api/extract", async (request, response) => {
    const text = typeof request.body?.text === "string" ? request.body.text.trim() : "";

    if (!text) {
      response.status(400).json({ error: "请先输入招聘沟通记录。" });
      return;
    }

    try {
      const result = await extractor(text);
      response.json(result);
    } catch (error) {
      if (error instanceof ExtractionError) {
        response.status(error.statusCode).json({ error: error.publicMessage });
        return;
      }

      response.status(500).json({ error: "AI 提取服务暂时不可用，请稍后重试。" });
    }
  });

  return app;
};

const isDirectRun = process.argv[1]?.endsWith("server/index.ts");

if (isDirectRun) {
  const port = Number(process.env.PORT || 8787);
  createApp().listen(port, () => {
    console.log(`Recruiting cockpit API listening on http://localhost:${port}`);
  });
}
```

- [ ] **Step 4: Run API tests**

Run: `npm test -- server/index.test.ts`

Expected: PASS for 3 tests.

- [ ] **Step 5: Commit Express API**

```bash
git add server/index.ts server/index.test.ts
git commit -m "feat: add recruiting extraction API"
```

---

## Task 5: Frontend Data, API Client, and Cockpit UI

**Files:**
- Create: `src/data/sample.ts`
- Create: `src/api/extract.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/styles.css`
- Create: `src/App.test.tsx`

- [ ] **Step 1: Write failing UI tests in `src/App.test.tsx`**

```tsx
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
```

- [ ] **Step 2: Run UI tests to verify they fail**

Run: `npm test -- src/App.test.tsx`

Expected: FAIL because `src/App.tsx` and related files do not exist.

- [ ] **Step 3: Create `src/data/sample.ts`**

```ts
import type { Candidate } from "../domain/types";

export const sampleChatLog = `企业微信群-招聘推进 09:20
Mia：前端工程师候选人林悦来自内推，简历初筛通过，周三 15:00 安排技术面，我来跟进。
Leo：Boss直聘的产品经理周然昨天完成业务面，现在等用人经理反馈，先标记待反馈风险。
Ivy：猎头推荐的销售经理王磊还在沟通薪资，候选人期望偏高，今天需要再确认。
Mia：官网投递的数据分析师许宁已经接受 offer，下周一入职。`;

export const initialCandidates: Candidate[] = [
  {
    id: "1-林悦",
    name: "林悦",
    role: "前端工程师",
    source: "内推",
    stage: "待面试",
    owner: "Mia",
    interviewTime: "周三 15:00",
    lastContact: "今天",
    risk: "",
    summary: "初筛通过，等待技术面",
    confidence: 0.92,
  },
  {
    id: "2-周然",
    name: "周然",
    role: "产品经理",
    source: "Boss直聘",
    stage: "已面试",
    owner: "Leo",
    interviewTime: "昨天",
    lastContact: "昨天",
    risk: "待反馈",
    summary: "业务面完成，等待用人经理反馈",
    confidence: 0.84,
  },
  {
    id: "3-王磊",
    name: "王磊",
    role: "销售经理",
    source: "猎头",
    stage: "沟通中",
    owner: "Ivy",
    interviewTime: "",
    lastContact: "今天",
    risk: "薪资风险",
    summary: "薪资期望偏高，需要二次确认",
    confidence: 0.79,
  },
];
```

- [ ] **Step 4: Create `src/api/extract.ts`**

```ts
import type { ExtractionResponse } from "../domain/types";

export const extractCandidates = async (text: string): Promise<ExtractionResponse> => {
  const response = await fetch("/api/extract", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "AI 提取失败，请稍后重试。");
  }

  return payload as ExtractionResponse;
};
```

- [ ] **Step 5: Create `src/main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

- [ ] **Step 6: Create `src/App.tsx`**

```tsx
import {
  AlertTriangle,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Clock3,
  DatabaseZap,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { extractCandidates } from "./api/extract";
import { initialCandidates, sampleChatLog } from "./data/sample";
import { mergeCandidates } from "./domain/candidates";
import { calculateChannelStats, calculateFunnel, calculateOverview, getRiskCandidates } from "./domain/metrics";
import { STAGES, type Candidate, type Stage } from "./domain/types";

const formatConfidence = (confidence: number) => `${Math.round(confidence * 100)}%`;

export default function App() {
  const [inputText, setInputText] = useState(sampleChatLog);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [isExtracting, setIsExtracting] = useState(false);
  const [message, setMessage] = useState("");

  const overview = useMemo(() => calculateOverview(candidates), [candidates]);
  const funnel = useMemo(() => calculateFunnel(candidates), [candidates]);
  const channelStats = useMemo(() => calculateChannelStats(candidates), [candidates]);
  const riskCandidates = useMemo(() => getRiskCandidates(candidates), [candidates]);
  const maxFunnelCount = Math.max(1, ...funnel.map((item) => item.count));

  const handleExtract = async () => {
    if (!inputText.trim()) {
      setMessage("请先输入招聘沟通记录。");
      return;
    }

    setIsExtracting(true);
    setMessage("");

    try {
      const result = await extractCandidates(inputText);
      setCandidates((current) => mergeCandidates(current, result.candidates));
      setMessage(`AI 已提取 ${result.candidates.length} 条候选人记录，并同步刷新看板。`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "AI 提取失败，请稍后重试。");
    } finally {
      setIsExtracting(false);
    }
  };

  const updateStage = (id: string, stage: Stage) => {
    setCandidates((current) =>
      current.map((candidate) => (candidate.id === id ? { ...candidate, stage } : candidate)),
    );
  };

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">AI 招聘数据自动化</p>
          <h1>招聘提效管理驾驶舱</h1>
        </div>
        <div className="topbar-badge">
          <DatabaseZap size={18} />
          企业微信 / 群聊 / 腾讯文档记录结构化
        </div>
      </header>

      <section className="metric-grid" aria-label="管理概览">
        <MetricCard icon={<Users />} label="总候选人" value={overview.totalCandidates.toString()} detail="自动沉淀招聘流水" />
        <MetricCard icon={<BriefcaseBusiness />} label="活跃岗位" value={overview.activeRoles.toString()} detail="覆盖当前招聘需求" />
        <MetricCard
          icon={<BarChart3 />}
          label="面试转化率"
          value={`${overview.interviewConversionRate}%`}
          detail="已面试及后续阶段"
          testId="conversion-rate"
        />
        <MetricCard
          icon={<AlertTriangle />}
          label="风险项"
          value={overview.riskCount.toString()}
          detail="需要管理层关注"
          testId="risk-count"
        />
        <MetricCard icon={<Clock3 />} label="节省工时" value={`${overview.savedHours}h`} detail="按每条 6 分钟估算" />
      </section>

      <section className="workspace">
        <aside className="ingest-panel">
          <div className="panel-heading">
            <Bot size={20} />
            <div>
              <h2>招聘记录导入</h2>
              <p>粘贴聊天或在线文档记录，调用 OpenAI 结构化提取。</p>
            </div>
          </div>
          <textarea
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            aria-label="招聘沟通记录"
          />
          <button className="primary-button" type="button" onClick={handleExtract} disabled={isExtracting}>
            <Bot size={18} />
            {isExtracting ? "提取中..." : "AI 提取"}
          </button>
          {message ? <p className="status-message">{message}</p> : null}
        </aside>

        <section className="dashboard-grid">
          <section className="panel candidate-panel">
            <div className="section-title">
              <h2>候选人流水</h2>
              <span>{candidates.length} 条记录</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>候选人</th>
                    <th>岗位</th>
                    <th>渠道</th>
                    <th>阶段</th>
                    <th>负责人</th>
                    <th>风险</th>
                    <th>置信度</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((candidate) => (
                    <tr key={candidate.id}>
                      <td>
                        <strong>{candidate.name}</strong>
                        <small>{candidate.summary}</small>
                      </td>
                      <td>{candidate.role}</td>
                      <td>{candidate.source}</td>
                      <td>
                        <select
                          aria-label={`${candidate.name}阶段`}
                          value={candidate.stage}
                          onChange={(event) => updateStage(candidate.id, event.target.value as Stage)}
                        >
                          {STAGES.map((stage) => (
                            <option key={stage} value={stage}>
                              {stage}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{candidate.owner}</td>
                      <td>{candidate.risk || "无"}</td>
                      <td>{formatConfidence(candidate.confidence)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="panel">
            <div className="section-title">
              <h2>招聘漏斗</h2>
              <span>阶段分布</span>
            </div>
            <div className="funnel-list">
              {funnel.map((item) => (
                <div className="funnel-row" key={item.stage}>
                  <span>{item.stage}</span>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(item.count / maxFunnelCount) * 100}%` }} />
                  </div>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-title">
              <h2>渠道效率</h2>
              <span>面试转化</span>
            </div>
            <div className="channel-list">
              {channelStats.map((channel) => (
                <div className="channel-item" key={channel.source}>
                  <div>
                    <strong>{channel.source}</strong>
                    <span>
                      {channel.total} 人 / 已面试 {channel.interviewed} / 入职 {channel.hired}
                    </span>
                  </div>
                  <b>{channel.conversionRate}%</b>
                </div>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="section-title">
              <h2>风险提醒</h2>
              <span>{riskCandidates.length} 项</span>
            </div>
            <div className="risk-list">
              {riskCandidates.map((candidate) => (
                <div className="risk-item" key={candidate.id}>
                  <AlertTriangle size={16} />
                  <div>
                    <strong>
                      {candidate.name} · {candidate.role}
                    </strong>
                    <span>{candidate.risk}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </section>
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  testId,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
  testId?: string;
}) {
  return (
    <article className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div>
        <span>{label}</span>
        <strong data-testid={testId}>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}
```

- [ ] **Step 7: Create `src/styles.css`**

```css
:root {
  color: #172033;
  background: #f5f7fb;
  font-family:
    Inter, "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
}

button,
textarea,
select {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  padding: 24px;
}

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 6px;
  color: #2270c7;
  font-size: 13px;
  font-weight: 700;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 0;
  font-size: 30px;
}

h2 {
  margin-bottom: 0;
  font-size: 17px;
}

.topbar-badge,
.primary-button,
.panel-heading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.topbar-badge {
  border: 1px solid #cbd8e8;
  border-radius: 8px;
  padding: 10px 12px;
  color: #33506f;
  background: #ffffff;
  font-size: 14px;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.metric-card,
.panel,
.ingest-panel {
  border: 1px solid #dbe4ef;
  border-radius: 8px;
  background: #ffffff;
}

.metric-card {
  display: flex;
  gap: 12px;
  min-height: 112px;
  padding: 16px;
}

.metric-card span,
.metric-card small,
.section-title span,
.panel-heading p,
.channel-item span,
.risk-item span,
td small {
  color: #64748b;
}

.metric-card strong {
  display: block;
  margin: 4px 0;
  font-size: 28px;
}

.metric-icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 8px;
  color: #0b73d9;
  background: #e8f2ff;
}

.workspace {
  display: grid;
  grid-template-columns: minmax(320px, 0.8fr) minmax(620px, 1.8fr);
  gap: 16px;
  align-items: start;
}

.ingest-panel,
.panel {
  padding: 16px;
}

.panel-heading {
  align-items: flex-start;
  margin-bottom: 14px;
}

.panel-heading p {
  margin: 4px 0 0;
  line-height: 1.5;
}

textarea {
  width: 100%;
  min-height: 340px;
  resize: vertical;
  border: 1px solid #cbd8e8;
  border-radius: 8px;
  padding: 12px;
  line-height: 1.6;
  color: #1f2937;
  background: #fbfdff;
}

.primary-button {
  justify-content: center;
  width: 100%;
  min-height: 42px;
  margin-top: 12px;
  border: 0;
  border-radius: 8px;
  color: #ffffff;
  background: #0b73d9;
  cursor: pointer;
}

.primary-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.status-message {
  margin: 12px 0 0;
  color: #1f4e79;
  line-height: 1.5;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.candidate-panel {
  grid-column: 1 / -1;
}

.section-title {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 780px;
}

th,
td {
  border-bottom: 1px solid #edf1f6;
  padding: 12px 10px;
  text-align: left;
  vertical-align: top;
  font-size: 14px;
}

th {
  color: #475569;
  font-size: 13px;
  background: #f8fafc;
}

td small {
  display: block;
  margin-top: 4px;
  line-height: 1.4;
}

select {
  min-width: 92px;
  border: 1px solid #cbd8e8;
  border-radius: 6px;
  padding: 6px 8px;
  background: #ffffff;
}

.funnel-list,
.channel-list,
.risk-list {
  display: grid;
  gap: 10px;
}

.funnel-row {
  display: grid;
  grid-template-columns: 70px 1fr 28px;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.bar-track {
  height: 10px;
  overflow: hidden;
  border-radius: 999px;
  background: #e8edf5;
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
  background: #0b73d9;
}

.channel-item,
.risk-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid #edf1f6;
  border-radius: 8px;
  padding: 12px;
}

.channel-item span,
.risk-item span {
  display: block;
  margin-top: 4px;
  font-size: 13px;
}

.risk-item {
  justify-content: flex-start;
  color: #8a4b10;
  background: #fff8ed;
}

@media (max-width: 1100px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .workspace,
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .app-shell {
    padding: 16px;
  }

  .topbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .metric-grid {
    grid-template-columns: 1fr;
  }
}
```

- [ ] **Step 8: Run UI tests**

Run: `npm test -- src/App.test.tsx`

Expected: PASS for 3 tests.

- [ ] **Step 9: Commit frontend cockpit**

```bash
git add src/data/sample.ts src/api/extract.ts src/main.tsx src/App.tsx src/styles.css src/App.test.tsx
git commit -m "feat: build recruiting management cockpit UI"
```

---

## Task 6: README and End-to-End Verification

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```md
# 招聘提效管理驾驶舱 Demo

这是一个本地可运行的招聘提效 demo。它模拟企业微信、微信群、腾讯在线文档里的招聘沟通记录，通过后端调用 OpenAI API，将非结构化文本提取为候选人数据，并在单页管理驾驶舱里展示招聘漏斗、渠道效率、风险提醒和节省工时。

## 功能

- 粘贴中文招聘沟通记录。
- 使用 OpenAI Responses API 结构化提取候选人。
- 自动生成候选人流水。
- 支持候选人阶段更新。
- 实时刷新管理层指标、招聘漏斗、渠道效率和风险提醒。
- 未配置 API key 时仍可查看内置样例看板，点击提取会显示明确配置错误。

## 环境要求

- Node.js 20+
- npm 10+
- OpenAI API key

## 安装

```bash
npm install
```

## 配置 OpenAI

```bash
cp .env.example .env
```

在 `.env` 中填写：

```bash
OPENAI_API_KEY=你的 OpenAI API Key
OPENAI_MODEL=gpt-5.5
PORT=8787
```

`OPENAI_MODEL` 可省略，默认使用 `gpt-5.5`。演示时如果想降低成本，可改成账号可用的轻量模型。

## 启动

```bash
npm run dev
```

默认地址：

- 前端：http://localhost:5173
- 后端：http://localhost:8787

## 演示步骤

1. 打开 http://localhost:5173。
2. 查看默认样例候选人和管理指标。
3. 在左侧文本框粘贴招聘沟通记录，或直接使用内置样例。
4. 点击“AI 提取”。
5. 查看候选人流水、招聘漏斗、渠道效率和风险提醒自动刷新。
6. 修改候选人阶段，观察指标同步更新。

## 测试

```bash
npm test
npm run typecheck
npm run build
```

## API

### POST `/api/extract`

请求：

```json
{
  "text": "招聘沟通记录"
}
```

响应：

```json
{
  "candidates": [
    {
      "id": "1-林悦",
      "name": "林悦",
      "role": "前端工程师",
      "source": "内推",
      "stage": "待面试",
      "owner": "Mia",
      "interviewTime": "周三 15:00",
      "lastContact": "今天",
      "risk": "",
      "summary": "初筛通过，等待技术面",
      "confidence": 0.92
    }
  ]
}
```
```

- [ ] **Step 2: Create `.env.example`**

Create `.env.example` with:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.5
PORT=8787
```

- [ ] **Step 3: Run full automated verification**

Run: `npm test`

Expected: all Vitest suites pass.

Run: `npm run typecheck`

Expected: TypeScript exits with code 0.

Run: `npm run build`

Expected: Vite production build exits with code 0 and creates `dist`.

- [ ] **Step 4: Run local demo**

Run: `npm run dev`

Expected:

- API logs `Recruiting cockpit API listening on http://localhost:8787`.
- Vite logs local URL `http://localhost:5173`.
- Browser shows the dashboard with sample candidates.
- Without `OPENAI_API_KEY`, clicking “AI 提取” displays `未配置 OPENAI_API_KEY，无法调用 OpenAI API。`.
- With `OPENAI_API_KEY`, clicking “AI 提取” returns candidate rows from OpenAI and refreshes metrics.

- [ ] **Step 5: Commit docs and verification**

```bash
git add README.md .env.example
git commit -m "docs: add recruiting cockpit demo instructions"
```

---

## Self-Review

- Spec coverage: Tasks cover single-page cockpit, sample data, paste-to-extract flow, real OpenAI call through backend, candidate tracking, management metrics, risk handling, README, tests, and local startup.
- Scope: No real Enterprise WeChat API, Tencent Docs API, login, database, or production deployment are included.
- Type consistency: `Candidate`, `Stage`, `ExtractionResponse`, metric names, `/api/extract`, and stage labels match across frontend, server, tests, and README.
- OpenAI API: The plan uses the Responses API with `text.format` JSON schema structured outputs and `output_text`.
