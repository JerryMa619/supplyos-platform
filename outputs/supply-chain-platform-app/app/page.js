"use client";

import { useMemo, useState } from "react";
import {
  connectors,
  dataModels,
  documents,
  fieldMappings,
  pipelineSteps,
  purchaseOrders,
  skus,
  suppliers
} from "@/lib/mockData";
import { badgeClass, daysUntilStockout, money, recommendedQty } from "@/lib/supplyMath";

const views = [
  { id: "overview", label: "今日工作台", icon: "⌂" },
  { id: "connections", label: "数据接入", icon: "⇄" },
  { id: "replenishment", label: "补货计划", icon: "↻" },
  { id: "compliance", label: "合规文件", icon: "◇" },
  { id: "suppliers", label: "供应商", icon: "▦" }
];

const starterMessages = [
  {
    role: "assistant",
    text: "早上好。平台会先把商家的店铺、ERP、数据库、3PL 和供应商文件映射到统一供应链模型，然后生成补货、PO 和合规风险任务。"
  }
];

function matchesSearch(search, ...values) {
  if (!search) return true;
  return values.join(" ").toLowerCase().includes(search);
}

function Metric({ label, value, trend, tone }) {
  return (
    <article className="metric">
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
      <span className={`trend ${tone || ""}`}>{trend}</span>
    </article>
  );
}

function Badge({ children, tone }) {
  return <span className={`badge ${tone || "low"}`}>{children}</span>;
}

function PanelHeading({ eyebrow, title, action }) {
  return (
    <div className="panel-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export default function SupplyOSApp() {
  const [activeView, setActiveView] = useState("overview");
  const [search, setSearch] = useState("");
  const [serviceLevel, setServiceLevel] = useState(95);
  const [riskFilter, setRiskFilter] = useState("all");
  const [messages, setMessages] = useState(starterMessages);
  const [toast, setToast] = useState("");
  const [syncSummary, setSyncSummary] = useState(null);

  const normalizedSearch = search.trim().toLowerCase();

  const spend = useMemo(
    () => skus.reduce((sum, sku) => sum + Math.max(0, recommendedQty(sku, serviceLevel)) * sku.unitCost, 0),
    [serviceLevel]
  );

  const riskySkuCount = skus.filter((sku) => daysUntilStockout(sku) < sku.leadTime + 14).length + 4;
  const latePoCount = purchaseOrders.filter((po) => po.delay > 0).length + 2;
  const gapCount = documents.filter((doc) => doc.risk !== "low").length + 10;

  const tasks = [
    {
      title: "先处理 HM-BAMBOO-SET 缺货与合规双风险",
      text: "库存可售约 9 天，但 Sunny Textile 的 OEKO-TEX 证书缺失。建议同时催交 PO-1048 和索要证书。",
      severity: "high",
      action: "生成邮件"
    },
    {
      title: "确认 Harbor Loom 延迟原因",
      text: "PO-1051 已延迟 11 天，HM-LINEN-02 预计 12 天后低于安全库存。",
      severity: "high",
      action: "催交期"
    },
    {
      title: "向 Pearl Plastics 索要原产地声明",
      text: "HM-STORAGE-XL 的合规缺口会影响下批清关材料归档。",
      severity: "medium",
      action: "索要文件"
    },
    {
      title: "给 Nova Components 追加采购量",
      text: "EL-CABLE-USB4 销量稳定，供应商评分 91，可优先补足 45 天覆盖。",
      severity: "low",
      action: "生成 PO"
    }
  ];

  function flash(message) {
    setToast(message);
    window.clearTimeout(flash.timer);
    flash.timer = window.setTimeout(() => setToast(""), 2600);
  }

  function addMessage(text, role = "assistant") {
    setMessages((current) => [...current, { role, text }]);
  }

  function copilotResponse(prompt) {
    const lower = prompt.toLowerCase();
    if (prompt.includes("接入") || prompt.includes("数据库") || lower.includes("database") || lower.includes("shopify")) {
      return "平台接入建议：先用 Shopify/3PL/ERP API 做标准连接器，再给 Postgres/MySQL 提供只读账号接入。所有来源先映射到 Product、Inventory、Sales Demand、Purchase Order、Supplier 和 Compliance File 六个核心对象。";
    }
    if (lower.includes("sunny") || prompt.includes("证书") || prompt.includes("催")) {
      return "建议动作：向 Sunny Textile 同时确认 PO-1048 的新 ETA，并索要 OEKO-TEX 与 Cotton Source Declaration。邮件草稿已包含 SKU、PO、缺货日期和文件截止日期。";
    }
    if (lower.includes("po") || prompt.includes("采购")) {
      return "我会优先生成 4 张 PO 草稿，并把高风险供应商标记为需人工复核。";
    }
    if (prompt.includes("合规") || lower.includes("compliance")) {
      return "当前高风险合规缺口来自 Sunny Textile 和 Pearl Plastics。建议先索要覆盖具体 SKU 的证书原件，再让 AI 复核供应商名称、有效期、标准编号和产品范围。";
    }
    return "我会把请求拆成库存影响、在途 PO 影响、供应商合规影响三类检查，然后生成可执行任务。";
  }

  function submitPrompt(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.prompt;
    const prompt = input.value.trim();
    if (!prompt) return;
    addMessage(prompt, "user");
    addMessage(copilotResponse(prompt));
    input.value = "";
  }

  async function runSyncCheck() {
    const connected = connectors.filter((connector) => connector.status === "已连接").length;
    const configurable = connectors.filter((connector) => connector.status === "可配置").length;
    const needsAction = connectors.length - connected - configurable;
    const result = {
      connected,
      configurable,
      needsAction,
      summary: `${connectors.length} 个连接器中 ${connected} 个已连接，${configurable} 个可配置数据库，${needsAction} 个需要授权或字段确认。建议先让商家接订单、库存、采购单三类数据。`
    };
    setSyncSummary(result);
    addMessage(`同步检查完成：${result.summary}`);
    flash("同步检查已完成。");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="主导航">
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>SupplyOS</strong>
            <span>AI Supply Desk</span>
          </div>
        </div>
        <nav className="nav-list">
          {views.map((view) => (
            <button
              className={`nav-item ${activeView === view.id ? "active" : ""}`}
              key={view.id}
              onClick={() => setActiveView(view.id)}
              title={view.label}
              type="button"
            >
              <span aria-hidden="true">{view.icon}</span>
              <span>{view.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-panel">
          <span className="eyebrow">本周重点</span>
          <strong>先完成商家数据接入闭环</strong>
          <p>订单、库存、PO 三类数据接入后，平台就能自动刷新补货和供应商任务。</p>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">2026-06-29 · Web SaaS App</p>
            <h1>AI 采购与供应商管理平台</h1>
          </div>
          <div className="topbar-actions">
            <label className="search" title="搜索 SKU、供应商或 PO">
              <span aria-hidden="true">⌕</span>
              <input
                onChange={(event) => setSearch(event.target.value)}
                placeholder="搜索 SKU / 供应商 / PO"
                type="search"
                value={search}
              />
            </label>
            <button className="icon-button" onClick={() => flash("应用状态已刷新。")} title="刷新今日简报" type="button">
              ↺
            </button>
          </div>
        </header>

        {activeView === "overview" && (
          <OverviewView
            gapCount={gapCount}
            latePoCount={latePoCount}
            messages={messages}
            normalizedSearch={normalizedSearch}
            onAction={flash}
            onAutoPlan={() => {
              addMessage("已生成今日行动计划：1. 检查 Shopify 和 3PL 同步；2. 催 Sunny Textile 确认 PO-1048；3. 索要 Pearl Plastics 原产地声明；4. 给 Nova Components 生成追加 PO。");
              flash("行动计划已生成。");
            }}
            onSubmitPrompt={submitPrompt}
            riskFilter={riskFilter}
            riskySkuCount={riskySkuCount}
            serviceLevel={serviceLevel}
            setRiskFilter={setRiskFilter}
            spend={spend}
            tasks={tasks}
          />
        )}

        {activeView === "connections" && (
          <ConnectionsView
            normalizedSearch={normalizedSearch}
            onAddConnector={() => flash("连接器向导已准备：选择来源、授权、字段映射、同步检查。")}
            onConfigure={(name) => flash(`${name} 连接器配置已打开。`)}
            onRunSync={runSyncCheck}
            syncSummary={syncSummary}
          />
        )}

        {activeView === "replenishment" && (
          <ReplenishmentView
            normalizedSearch={normalizedSearch}
            onAction={flash}
            serviceLevel={serviceLevel}
            setServiceLevel={setServiceLevel}
          />
        )}

        {activeView === "compliance" && (
          <ComplianceView
            normalizedSearch={normalizedSearch}
            onAction={(message) => {
              addMessage(message);
              flash("AI 文件审核已完成。");
            }}
          />
        )}

        {activeView === "suppliers" && <SuppliersView normalizedSearch={normalizedSearch} />}
      </main>

      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}

function OverviewView({
  gapCount,
  latePoCount,
  messages,
  normalizedSearch,
  onAction,
  onAutoPlan,
  onSubmitPrompt,
  riskFilter,
  riskySkuCount,
  setRiskFilter,
  spend,
  tasks
}) {
  const risks = skus
    .map((sku) => {
      const stockoutDays = daysUntilStockout(sku);
      const po = purchaseOrders.find((item) => item.sku === sku.id);
      const doc = documents.find((item) => item.sku === sku.id && item.risk !== "low");
      const riskType = stockoutDays < sku.leadTime ? "stockout" : doc ? "compliance" : "stable";
      return { sku, po, doc, stockoutDays, riskType };
    })
    .filter((item) => riskFilter === "all" || item.riskType === riskFilter)
    .filter((item) => matchesSearch(normalizedSearch, item.sku.id, item.sku.name, item.sku.supplier));

  return (
    <section className="view active">
      <div className="metric-grid">
        <Metric label="30 天缺货风险" value={riskySkuCount} trend="+3 vs 上周" tone="danger" />
        <Metric label="建议采购金额" value={money(spend)} trend="覆盖 42 天" />
        <Metric label="待催 PO" value={latePoCount} trend="最晚延迟 11 天" tone="warning" />
        <Metric label="合规缺口" value={gapCount} trend="5 个高风险" tone="danger" />
      </div>

      <div className="overview-layout">
        <section className="panel task-panel">
          <PanelHeading
            action={<button className="ghost-button" onClick={onAutoPlan} type="button">生成行动计划</button>}
            eyebrow="AI 优先级"
            title="今天先处理这些"
          />
          <div className="task-list">
            {tasks
              .filter((task) => matchesSearch(normalizedSearch, task.title, task.text))
              .map((task) => (
                <article className="task-card" key={task.title}>
                  <span className={`severity-dot ${task.severity}`} />
                  <div>
                    <h3>{task.title}</h3>
                    <p>{task.text}</p>
                  </div>
                  <button onClick={() => onAction(`${task.action}已准备好，等待你确认发送。`)} type="button">
                    {task.action}
                  </button>
                </article>
              ))}
          </div>
        </section>

        <section className="panel copilot">
          <PanelHeading eyebrow="Copilot" title="采购与合规助手" />
          <div className="chat-log" aria-live="polite">
            {messages.map((message, index) => (
              <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
                {message.text}
              </div>
            ))}
          </div>
          <form className="chat-input" onSubmit={onSubmitPrompt}>
            <input name="prompt" placeholder="例如：如何接入商家数据库？" type="text" />
            <button type="submit">发送</button>
          </form>
        </section>
      </div>

      <section className="panel">
        <PanelHeading
          action={
            <div className="segmented" role="tablist" aria-label="风险筛选">
              {[
                ["all", "全部"],
                ["stockout", "缺货"],
                ["compliance", "合规"]
              ].map(([value, label]) => (
                <button className={riskFilter === value ? "active" : ""} key={value} onClick={() => setRiskFilter(value)} type="button">
                  {label}
                </button>
              ))}
            </div>
          }
          eyebrow="风险地图"
          title="SKU、采购单与合规的交叉风险"
        />
        <div className="risk-board">
          {risks.map((item) => {
            const severity = item.stockoutDays < 14 || item.doc?.risk === "high" ? "high" : item.doc ? "medium" : "low";
            const label = item.riskType === "stockout" ? "缺货" : item.riskType === "compliance" ? "合规" : "稳定";
            return (
              <article className="risk-card" key={item.sku.id}>
                <header>
                  <div>
                    <h3>{item.sku.id}</h3>
                    <p>{item.sku.name}</p>
                  </div>
                  <Badge tone={badgeClass(severity)}>{label}</Badge>
                </header>
                <p>
                  预计 {item.stockoutDays} 天后触达缺货线；供应商 {item.sku.supplier}；
                  {item.po ? `${item.po.id} ${item.po.status}` : "暂无在途 PO"}。
                </p>
                <button onClick={() => onAction(`${item.sku.id} 的补货和合规处理建议已加入 Copilot。`)} type="button">
                  让 AI 处理
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}

function ConnectionsView({ normalizedSearch, onAddConnector, onConfigure, onRunSync, syncSummary }) {
  return (
    <section className="view active">
      <div className="connection-hero">
        <div>
          <span className="eyebrow">Data Onboarding</span>
          <h2>商家数据接入中心</h2>
          <p>把店铺、ERP、数据库、3PL 和供应商文件接入统一供应链模型。</p>
        </div>
        <button className="primary-button" onClick={onRunSync} type="button">运行同步检查</button>
      </div>

      {syncSummary && (
        <section className="sync-summary">
          <strong>同步检查完成</strong>
          <span>{syncSummary.summary}</span>
        </section>
      )}

      <section className="panel">
        <PanelHeading
          action={<button className="ghost-button" onClick={onAddConnector} type="button">添加连接器</button>}
          eyebrow="Connectors"
          title="连接器状态"
        />
        <div className="connector-grid">
          {connectors
            .filter((connector) => matchesSearch(normalizedSearch, connector.name, connector.type, connector.status, connector.scope))
            .map((connector) => (
              <article className="connector-card" key={connector.name}>
                <header>
                  <div>
                    <h3>{connector.name}</h3>
                    <p>{connector.type}</p>
                  </div>
                  <Badge tone={badgeClass(connector.health)}>{connector.status}</Badge>
                </header>
                <div className="connector-meta">
                  <span>同步频率 <b>{connector.cadence}</b></span>
                  <span>数据范围 <b>{connector.scope}</b></span>
                </div>
                <button onClick={() => onConfigure(connector.name)} type="button">配置</button>
              </article>
            ))}
        </div>
      </section>

      <div className="data-layout">
        <section className="panel">
          <PanelHeading eyebrow="Canonical Model" title="标准供应链数据模型" />
          <div className="model-grid">
            {dataModels
              .filter((model) => matchesSearch(normalizedSearch, model.name, model.owner, model.fields.join(" ")))
              .map((model) => (
                <article className="model-card" key={model.name}>
                  <header>
                    <div>
                      <h3>{model.name}</h3>
                      <p>{model.owner}</p>
                    </div>
                    <Badge tone="blue">{model.fields.length} 字段</Badge>
                  </header>
                  <ul>{model.fields.map((field) => <li key={field}>{field}</li>)}</ul>
                </article>
              ))}
          </div>
        </section>

        <section className="panel">
          <PanelHeading eyebrow="Sync Pipeline" title="同步管道" />
          <ol className="pipeline-list">
            {pipelineSteps.map((step) => (
              <li key={step.title}>
                <strong>{step.title}</strong>
                <span>{step.detail} <b>{step.status}</b></span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className="panel">
        <PanelHeading eyebrow="Field Mapping" title="字段映射预览" />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>来源字段</th>
                <th>标准字段</th>
                <th>业务对象</th>
                <th>质量检查</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {fieldMappings
                .filter((mapping) => matchesSearch(normalizedSearch, mapping.source, mapping.target, mapping.object, mapping.status))
                .map((mapping) => (
                  <tr key={mapping.source}>
                    <td><strong>{mapping.source}</strong></td>
                    <td>{mapping.target}</td>
                    <td>{mapping.object}</td>
                    <td>{mapping.check}</td>
                    <td><Badge tone={mapping.status === "需确认" ? "medium" : "low"}>{mapping.status}</Badge></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function ReplenishmentView({ normalizedSearch, onAction, serviceLevel, setServiceLevel }) {
  return (
    <section className="view active">
      <section className="panel">
        <PanelHeading
          action={
            <div className="toolbar">
              <label className="compact-field">
                <span>服务水平</span>
                <input max="99" min="85" onChange={(event) => setServiceLevel(Number(event.target.value))} type="range" value={serviceLevel} />
                <b>{serviceLevel}%</b>
              </label>
              <button className="primary-button" onClick={() => onAction("已生成 5 条 PO 草稿，可按供应商合并发送。")} type="button">生成 PO 草稿</button>
            </div>
          }
          eyebrow="Replenishment"
          title="补货建议"
        />
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>当前库存</th>
                <th>日销量</th>
                <th>预计缺货</th>
                <th>建议采购</th>
                <th>供应商</th>
                <th>状态</th>
              </tr>
            </thead>
            <tbody>
              {skus
                .filter((sku) => matchesSearch(normalizedSearch, sku.id, sku.name, sku.supplier))
                .map((sku) => {
                  const days = daysUntilStockout(sku);
                  const qty = Math.max(0, recommendedQty(sku, serviceLevel));
                  const status = days < sku.leadTime ? "需立即下单" : days < sku.leadTime + 14 ? "本周确认" : "观察";
                  const risk = status === "需立即下单" ? "high" : status === "本周确认" ? "medium" : "low";
                  return (
                    <tr key={sku.id}>
                      <td><strong>{sku.id}</strong><br /><span>{sku.name}</span></td>
                      <td>{sku.stock.toLocaleString()}</td>
                      <td>{sku.dailySales}/天</td>
                      <td>{days} 天</td>
                      <td>{qty.toLocaleString()} 件 · {money(qty * sku.unitCost)}</td>
                      <td>{sku.supplier}</td>
                      <td><Badge tone={badgeClass(risk)}>{status}</Badge></td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <PanelHeading eyebrow="PO Control" title="采购单跟踪" />
        <div className="po-grid">
          {purchaseOrders
            .filter((po) => matchesSearch(normalizedSearch, po.id, po.supplier, po.sku, po.status))
            .map((po) => (
              <article className="po-card" key={po.id}>
                <header>
                  <div>
                    <h3>{po.id}</h3>
                    <p>{po.supplier}</p>
                  </div>
                  <Badge tone={po.delay > 7 ? "high" : po.delay > 0 ? "medium" : "low"}>{po.status}</Badge>
                </header>
                <dl>
                  <div><dt>SKU</dt><dd>{po.sku}</dd></div>
                  <div><dt>数量</dt><dd>{po.qty.toLocaleString()}</dd></div>
                  <div><dt>ETA</dt><dd>{po.eta}</dd></div>
                  <div><dt>延迟</dt><dd>{po.delay} 天</dd></div>
                </dl>
                <button onClick={() => onAction(`${po.id} 催办邮件草稿已生成。`)} type="button">生成催办邮件</button>
              </article>
            ))}
        </div>
      </section>
    </section>
  );
}

function ComplianceView({ normalizedSearch, onAction }) {
  return (
    <section className="view active">
      <section className="panel">
        <PanelHeading
          action={<button className="primary-button" type="button">向供应商索要文件</button>}
          eyebrow="Compliance"
          title="供应商文件与 SKU 合规"
        />
        <div className="compliance-layout">
          <div className="doc-checklist">
            {documents
              .filter((doc) => matchesSearch(normalizedSearch, doc.name, doc.supplier, doc.sku, doc.status))
              .map((doc) => (
                <article className="doc-card" key={`${doc.supplier}-${doc.name}`}>
                  <header>
                    <div>
                      <h3>{doc.name}</h3>
                      <p>{doc.supplier} · {doc.sku}</p>
                    </div>
                    <Badge tone={badgeClass(doc.risk)}>{doc.status}</Badge>
                  </header>
                  <p>到期/缺失时间：{doc.due}。AI 会校验文件是否覆盖对应 SKU、供应商名称和有效期。</p>
                  <button type="button">索要或复核</button>
                </article>
              ))}
          </div>
          <div className="upload-zone">
            <span aria-hidden="true">⇧</span>
            <strong>上传供应商文件</strong>
            <p>拖入测试报告、原产地证明、材料声明或证书，AI 会抽取有效期与覆盖 SKU。</p>
            <button
              className="ghost-button"
              onClick={() => onAction("AI 审核结果：上传文件覆盖 Sunny Textile，但证书产品范围未包含 HM-BAMBOO-SET，需要供应商补充 Annex 页。")}
              type="button"
            >
              模拟 AI 审核
            </button>
          </div>
        </div>
      </section>
    </section>
  );
}

function SuppliersView({ normalizedSearch }) {
  return (
    <section className="view active">
      <section className="panel">
        <PanelHeading eyebrow="Supplier Intelligence" title="供应商评分" />
        <div className="supplier-grid">
          {suppliers
            .filter((supplier) => matchesSearch(normalizedSearch, supplier.name, supplier.risk))
            .map((supplier) => (
              <article className="supplier-card" key={supplier.name}>
                <header>
                  <div>
                    <h3>{supplier.name}</h3>
                    <p>综合评分 {supplier.score}/100</p>
                  </div>
                  <Badge tone={badgeClass(supplier.risk)}>{supplier.risk}风险</Badge>
                </header>
                <div className="score-bar" aria-label={`综合评分 ${supplier.score}`}>
                  <span style={{ width: `${supplier.score}%` }} />
                </div>
                <dl>
                  <div><dt>准时率</dt><dd>{supplier.onTime}%</dd></div>
                  <div><dt>文件完整</dt><dd>{supplier.docs}%</dd></div>
                  <div><dt>成本变化</dt><dd>{supplier.cost}</dd></div>
                  <div><dt>响应速度</dt><dd>{supplier.response}</dd></div>
                </dl>
              </article>
            ))}
        </div>
      </section>
    </section>
  );
}
