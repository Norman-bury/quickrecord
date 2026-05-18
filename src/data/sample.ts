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
