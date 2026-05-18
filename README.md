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
- OpenAI API key（仅真实 AI 提取需要；未配置 key 时仍可预览内置样例看板）

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

`OPENAI_MODEL` 可省略，默认使用 `gpt-5.5`。演示时如果想降低成本，可改成账号可用的轻量模型。真实 OpenAI 提取需要配置有效的 API key；除非你提供可用 key，否则本地只能验证无 key 样例预览和错误提示路径。

## 启动

```bash
npm run dev
```

默认地址：

- 前端：http://localhost:5173
- 后端：http://localhost:8787

## 演示步骤

1. 打开 http://localhost:5173。
2. 未配置 `OPENAI_API_KEY` 时，可查看默认样例候选人和管理指标；点击“AI 提取”会显示 `未配置 OPENAI_API_KEY，无法调用 OpenAI API。`。
3. 已配置有效 `OPENAI_API_KEY` 时，在左侧文本框粘贴招聘沟通记录，或直接使用内置样例。
4. 点击“AI 提取”，后端会调用 OpenAI，新增或更新候选人流水，并刷新招聘漏斗、渠道效率、风险提醒和管理指标。
5. 修改候选人阶段，观察指标同步更新。

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
