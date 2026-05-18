import {
  AlertTriangle,
  BarChart3,
  Bot,
  BriefcaseBusiness,
  Clock3,
  DatabaseZap,
  Users,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
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
  icon: ReactNode;
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
