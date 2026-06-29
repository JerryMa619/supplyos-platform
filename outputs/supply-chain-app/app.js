const skus = [
  {
    id: "HM-BAMBOO-SET",
    name: "Bamboo Bedding Set",
    stock: 412,
    dailySales: 44,
    leadTime: 28,
    safetyStock: 260,
    supplier: "Sunny Textile",
    unitCost: 18.4,
    compliance: "missing",
  },
  {
    id: "HM-LINEN-02",
    name: "Washed Linen Throw",
    stock: 238,
    dailySales: 19,
    leadTime: 35,
    safetyStock: 180,
    supplier: "Harbor Loom",
    unitCost: 14.2,
    compliance: "expiring",
  },
  {
    id: "EL-CABLE-USB4",
    name: "Braided USB-C Cable",
    stock: 1850,
    dailySales: 112,
    leadTime: 24,
    safetyStock: 900,
    supplier: "Nova Components",
    unitCost: 2.9,
    compliance: "ok",
  },
  {
    id: "HM-STORAGE-XL",
    name: "Foldable Storage Box XL",
    stock: 310,
    dailySales: 33,
    leadTime: 31,
    safetyStock: 300,
    supplier: "Pearl Plastics",
    unitCost: 6.7,
    compliance: "missing",
  },
  {
    id: "HM-TOWEL-WAFFLE",
    name: "Waffle Cotton Towel",
    stock: 526,
    dailySales: 27,
    leadTime: 30,
    safetyStock: 240,
    supplier: "Sunny Textile",
    unitCost: 5.6,
    compliance: "expiring",
  },
];

const purchaseOrders = [
  { id: "PO-1048", supplier: "Sunny Textile", sku: "HM-BAMBOO-SET", qty: 2400, eta: "2026-07-18", status: "待确认", delay: 5 },
  { id: "PO-1051", supplier: "Harbor Loom", sku: "HM-LINEN-02", qty: 1200, eta: "2026-07-24", status: "已延迟", delay: 11 },
  { id: "PO-1056", supplier: "Nova Components", sku: "EL-CABLE-USB4", qty: 6000, eta: "2026-07-10", status: "在途", delay: 0 },
  { id: "PO-1060", supplier: "Pearl Plastics", sku: "HM-STORAGE-XL", qty: 1800, eta: "2026-07-21", status: "缺 ASN", delay: 4 },
];

const documents = [
  { name: "OEKO-TEX Certificate", supplier: "Sunny Textile", sku: "HM-BAMBOO-SET", status: "缺失", risk: "high", due: "立即" },
  { name: "Material Declaration", supplier: "Harbor Loom", sku: "HM-LINEN-02", status: "15 天后过期", risk: "medium", due: "2026-07-14" },
  { name: "CE Test Report", supplier: "Nova Components", sku: "EL-CABLE-USB4", status: "有效", risk: "low", due: "2027-02-03" },
  { name: "Origin Statement", supplier: "Pearl Plastics", sku: "HM-STORAGE-XL", status: "缺失", risk: "high", due: "立即" },
  { name: "Cotton Source Declaration", supplier: "Sunny Textile", sku: "HM-TOWEL-WAFFLE", status: "9 天后过期", risk: "medium", due: "2026-07-08" },
];

const suppliers = [
  { name: "Sunny Textile", onTime: 78, docs: 62, cost: "稳定", response: "18h", risk: "高", score: 69 },
  { name: "Harbor Loom", onTime: 71, docs: 74, cost: "+4.2%", response: "9h", risk: "中", score: 73 },
  { name: "Nova Components", onTime: 92, docs: 96, cost: "-1.1%", response: "4h", risk: "低", score: 91 },
  { name: "Pearl Plastics", onTime: 81, docs: 55, cost: "+2.8%", response: "22h", risk: "高", score: 66 },
  { name: "Evergreen Pack", onTime: 88, docs: 89, cost: "稳定", response: "6h", risk: "低", score: 86 },
];

const connectors = [
  { name: "Shopify", type: "Commerce", status: "已连接", cadence: "每 30 分钟", scope: "订单、商品、库存", health: "low" },
  { name: "Amazon Seller", type: "Marketplace", status: "待授权", cadence: "OAuth", scope: "销售、FBA 库存", health: "medium" },
  { name: "PostgreSQL", type: "Database", status: "可配置", cadence: "只读副本", scope: "SKU、PO、供应商", health: "low" },
  { name: "MySQL", type: "Database", status: "可配置", cadence: "SSH 隧道", scope: "库存、入库、发票", health: "low" },
  { name: "NetSuite", type: "ERP", status: "映射中", cadence: "每 2 小时", scope: "采购单、账期、收货", health: "medium" },
  { name: "QuickBooks", type: "Accounting", status: "已连接", cadence: "每日", scope: "成本、供应商账款", health: "low" },
  { name: "ShipBob 3PL", type: "Warehouse", status: "已连接", cadence: "每小时", scope: "仓库库存、出入库", health: "low" },
  { name: "Supplier Portal", type: "Documents", status: "内测", cadence: "实时", scope: "证书、产地、测试报告", health: "medium" },
];

const dataModels = [
  { name: "Product & SKU", owner: "商品主数据", fields: ["sku", "barcode", "category", "unit_cost", "supplier_id"] },
  { name: "Inventory", owner: "库存事实表", fields: ["sku", "warehouse", "on_hand", "available", "inbound_qty"] },
  { name: "Sales Demand", owner: "需求信号", fields: ["sku", "channel", "order_date", "qty", "net_sales"] },
  { name: "Purchase Order", owner: "采购执行", fields: ["po_id", "supplier_id", "sku", "qty", "eta", "status"] },
  { name: "Supplier", owner: "供应商档案", fields: ["supplier_id", "lead_time", "moq", "payment_terms", "country"] },
  { name: "Compliance File", owner: "合规证据", fields: ["document_id", "sku", "supplier_id", "expires_at", "coverage"] },
];

const pipelineSteps = [
  { title: "连接", detail: "OAuth、API key、只读数据库账号或 SFTP。", status: "安全边界" },
  { title: "抽取", detail: "增量同步订单、库存、PO、供应商和文件元数据。", status: "CDC/定时" },
  { title: "映射", detail: "把商家字段映射到标准供应链模型。", status: "可复核" },
  { title: "质检", detail: "检测缺字段、重复 SKU、负库存、异常 lead time。", status: "自动" },
  { title: "生成洞察", detail: "刷新补货建议、PO 催办、合规缺口和供应商评分。", status: "AI 工作台" },
];

const fieldMappings = [
  { source: "shopify.variant.sku", target: "product.sku", object: "Product & SKU", check: "不能为空", status: "已匹配" },
  { source: "inventory.available", target: "inventory.available", object: "Inventory", check: "不允许负数", status: "已匹配" },
  { source: "po.expected_arrival", target: "purchase_order.eta", object: "Purchase Order", check: "日期格式", status: "需确认" },
  { source: "vendor.lead_days", target: "supplier.lead_time", object: "Supplier", check: "1-180 天", status: "已匹配" },
  { source: "document.expiry", target: "compliance_file.expires_at", object: "Compliance File", check: "过期提醒", status: "需确认" },
];

const state = {
  search: "",
  riskFilter: "all",
  serviceLevel: 95,
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));

function daysUntilStockout(sku) {
  return Math.floor(sku.stock / sku.dailySales);
}

function recommendedQty(sku) {
  const serviceFactor = state.serviceLevel >= 98 ? 1.35 : state.serviceLevel >= 95 ? 1.2 : 1.05;
  const cycleDemand = sku.dailySales * (sku.leadTime + 30);
  return Math.ceil((cycleDemand * serviceFactor + sku.safetyStock - sku.stock) / 50) * 50;
}

function money(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

function matchesSearch(...values) {
  if (!state.search) return true;
  const haystack = values.join(" ").toLowerCase();
  return haystack.includes(state.search);
}

function badgeClass(risk) {
  if (risk === "high" || risk === "高") return "high";
  if (risk === "medium" || risk === "中") return "medium";
  return "low";
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function renderTasks() {
  const tasks = [
    {
      title: "先处理 HM-BAMBOO-SET 缺货与合规双风险",
      text: "库存可售约 9 天，但 Sunny Textile 的 OEKO-TEX 证书缺失。建议同时催交 PO-1048 和索要证书。",
      severity: "high",
      action: "生成邮件",
    },
    {
      title: "确认 Harbor Loom 延迟原因",
      text: "PO-1051 已延迟 11 天，HM-LINEN-02 预计 12 天后低于安全库存。",
      severity: "high",
      action: "催交期",
    },
    {
      title: "向 Pearl Plastics 索要原产地声明",
      text: "HM-STORAGE-XL 的合规缺口会影响下批清关材料归档。",
      severity: "medium",
      action: "索要文件",
    },
    {
      title: "给 Nova Components 追加采购量",
      text: "EL-CABLE-USB4 销量稳定，供应商评分 91，可优先补足 45 天覆盖。",
      severity: "low",
      action: "生成 PO",
    },
  ];

  $("#taskList").innerHTML = tasks
    .filter((task) => matchesSearch(task.title, task.text))
    .map(
      (task) => `
        <article class="task-card">
          <span class="severity-dot ${task.severity}"></span>
          <div>
            <h3>${task.title}</h3>
            <p>${task.text}</p>
          </div>
          <button type="button" data-task-action="${task.action}" title="${task.action}">${task.action}</button>
        </article>
      `,
    )
    .join("");
}

function renderRiskBoard() {
  const risks = skus
    .map((sku) => {
      const stockoutDays = daysUntilStockout(sku);
      const po = purchaseOrders.find((item) => item.sku === sku.id);
      const doc = documents.find((item) => item.sku === sku.id && item.risk !== "low");
      const riskType = stockoutDays < sku.leadTime ? "stockout" : doc ? "compliance" : "stable";
      return { sku, po, doc, stockoutDays, riskType };
    })
    .filter((item) => state.riskFilter === "all" || item.riskType === state.riskFilter)
    .filter((item) => matchesSearch(item.sku.id, item.sku.name, item.sku.supplier));

  $("#riskBoard").innerHTML = risks
    .map((item) => {
      const severity = item.stockoutDays < 14 || item.doc?.risk === "high" ? "high" : item.doc ? "medium" : "low";
      const label = item.riskType === "stockout" ? "缺货" : item.riskType === "compliance" ? "合规" : "稳定";
      return `
        <article class="risk-card">
          <header>
            <div>
              <h3>${item.sku.id}</h3>
              <p>${item.sku.name}</p>
            </div>
            <span class="badge ${badgeClass(severity)}">${label}</span>
          </header>
          <p>预计 ${item.stockoutDays} 天后触达缺货线；供应商 ${item.sku.supplier}；${item.po ? `${item.po.id} ${item.po.status}` : "暂无在途 PO"}。</p>
          <button type="button" data-risk-sku="${item.sku.id}">让 AI 处理</button>
        </article>
      `;
    })
    .join("");
}

function renderReplenishment() {
  const rows = skus
    .filter((sku) => matchesSearch(sku.id, sku.name, sku.supplier))
    .map((sku) => {
      const days = daysUntilStockout(sku);
      const qty = Math.max(0, recommendedQty(sku));
      const status = days < sku.leadTime ? "需立即下单" : days < sku.leadTime + 14 ? "本周确认" : "观察";
      const risk = status === "需立即下单" ? "high" : status === "本周确认" ? "medium" : "low";
      return `
        <tr>
          <td><strong>${sku.id}</strong><br><span>${sku.name}</span></td>
          <td>${sku.stock.toLocaleString()}</td>
          <td>${sku.dailySales}/天</td>
          <td>${days} 天</td>
          <td>${qty.toLocaleString()} 件 · ${money(qty * sku.unitCost)}</td>
          <td>${sku.supplier}</td>
          <td><span class="badge ${badgeClass(risk)}">${status}</span></td>
        </tr>
      `;
    })
    .join("");
  $("#replenishmentRows").innerHTML = rows;
}

function renderPurchaseOrders() {
  $("#poGrid").innerHTML = purchaseOrders
    .filter((po) => matchesSearch(po.id, po.supplier, po.sku, po.status))
    .map(
      (po) => `
        <article class="po-card">
          <header>
            <div>
              <h3>${po.id}</h3>
              <p>${po.supplier}</p>
            </div>
            <span class="badge ${po.delay > 7 ? "high" : po.delay > 0 ? "medium" : "low"}">${po.status}</span>
          </header>
          <dl>
            <div><dt>SKU</dt><dd>${po.sku}</dd></div>
            <div><dt>数量</dt><dd>${po.qty.toLocaleString()}</dd></div>
            <div><dt>ETA</dt><dd>${po.eta}</dd></div>
            <div><dt>延迟</dt><dd>${po.delay} 天</dd></div>
          </dl>
          <button type="button" data-po="${po.id}">生成催办邮件</button>
        </article>
      `,
    )
    .join("");
}

function renderDocuments() {
  $("#docChecklist").innerHTML = documents
    .filter((doc) => matchesSearch(doc.name, doc.supplier, doc.sku, doc.status))
    .map(
      (doc) => `
        <article class="doc-card">
          <header>
            <div>
              <h3>${doc.name}</h3>
              <p>${doc.supplier} · ${doc.sku}</p>
            </div>
            <span class="badge ${badgeClass(doc.risk)}">${doc.status}</span>
          </header>
          <p>到期/缺失时间：${doc.due}。AI 会校验文件是否覆盖对应 SKU、供应商名称和有效期。</p>
          <button type="button" data-doc="${doc.name}">索要或复核</button>
        </article>
      `,
    )
    .join("");
}

function renderSuppliers() {
  $("#supplierGrid").innerHTML = suppliers
    .filter((supplier) => matchesSearch(supplier.name, supplier.risk))
    .map(
      (supplier) => `
        <article class="supplier-card">
          <header>
            <div>
              <h3>${supplier.name}</h3>
              <p>综合评分 ${supplier.score}/100</p>
            </div>
            <span class="badge ${badgeClass(supplier.risk)}">${supplier.risk}风险</span>
          </header>
          <div class="score-bar" aria-label="综合评分 ${supplier.score}">
            <span style="width:${supplier.score}%"></span>
          </div>
          <dl>
            <div><dt>准时率</dt><dd>${supplier.onTime}%</dd></div>
            <div><dt>文件完整</dt><dd>${supplier.docs}%</dd></div>
            <div><dt>成本变化</dt><dd>${supplier.cost}</dd></div>
            <div><dt>响应速度</dt><dd>${supplier.response}</dd></div>
          </dl>
        </article>
      `,
    )
    .join("");
}

function renderConnectors() {
  $("#connectorGrid").innerHTML = connectors
    .filter((connector) => matchesSearch(connector.name, connector.type, connector.status, connector.scope))
    .map(
      (connector) => `
        <article class="connector-card">
          <header>
            <div>
              <h3>${connector.name}</h3>
              <p>${connector.type}</p>
            </div>
            <span class="badge ${badgeClass(connector.health)}">${connector.status}</span>
          </header>
          <div class="connector-meta">
            <span>同步频率 <b>${connector.cadence}</b></span>
            <span>数据范围 <b>${connector.scope}</b></span>
          </div>
          <button type="button" data-connector="${connector.name}">配置</button>
        </article>
      `,
    )
    .join("");
}

function renderDataModels() {
  $("#modelGrid").innerHTML = dataModels
    .filter((model) => matchesSearch(model.name, model.owner, model.fields.join(" ")))
    .map(
      (model) => `
        <article class="model-card">
          <header>
            <div>
              <h3>${model.name}</h3>
              <p>${model.owner}</p>
            </div>
            <span class="badge blue">${model.fields.length} 字段</span>
          </header>
          <ul>${model.fields.map((field) => `<li>${field}</li>`).join("")}</ul>
        </article>
      `,
    )
    .join("");
}

function renderPipeline() {
  $("#pipelineList").innerHTML = pipelineSteps
    .map(
      (step) => `
        <li>
          <strong>${step.title}</strong>
          <span>${step.detail} <b>${step.status}</b></span>
        </li>
      `,
    )
    .join("");
}

function renderMappings() {
  $("#mappingRows").innerHTML = fieldMappings
    .filter((mapping) => matchesSearch(mapping.source, mapping.target, mapping.object, mapping.status))
    .map(
      (mapping) => `
        <tr>
          <td><strong>${mapping.source}</strong></td>
          <td>${mapping.target}</td>
          <td>${mapping.object}</td>
          <td>${mapping.check}</td>
          <td><span class="badge ${mapping.status === "需确认" ? "medium" : "low"}">${mapping.status}</span></td>
        </tr>
      `,
    )
    .join("");
}

function updateMetrics() {
  const riskySkuCount = skus.filter((sku) => daysUntilStockout(sku) < sku.leadTime + 14).length + 4;
  const spend = skus.reduce((sum, sku) => sum + Math.max(0, recommendedQty(sku)) * sku.unitCost, 0);
  const latePoCount = purchaseOrders.filter((po) => po.delay > 0).length + 2;
  const gapCount = documents.filter((doc) => doc.risk !== "low").length + 10;
  $("#riskSkuCount").textContent = riskySkuCount;
  $("#recommendedSpend").textContent = money(spend);
  $("#latePoCount").textContent = latePoCount;
  $("#complianceGapCount").textContent = gapCount;
}

function addMessage(text, role = "assistant") {
  const log = $("#chatLog");
  const message = document.createElement("div");
  message.className = `message ${role}`;
  message.textContent = text;
  log.appendChild(message);
  log.scrollTop = log.scrollHeight;
}

function generateCopilotResponse(prompt) {
  const lower = prompt.toLowerCase();
  if (lower.includes("sunny") || prompt.includes("证书") || prompt.includes("催")) {
    return "建议动作：向 Sunny Textile 同时确认 PO-1048 的新 ETA，并索要 OEKO-TEX 与 Cotton Source Declaration。邮件草稿已包含 SKU、PO、缺货日期和文件截止日期。";
  }
  if (lower.includes("po") || prompt.includes("采购")) {
    return "我会优先生成 4 张 PO 草稿：HM-BAMBOO-SET 3,350 件、HM-LINEN-02 2,100 件、HM-STORAGE-XL 2,250 件、EL-CABLE-USB4 5,650 件，并把高风险供应商标记为需人工复核。";
  }
  if (prompt.includes("接入") || prompt.includes("数据库") || lower.includes("database") || lower.includes("shopify")) {
    return "平台接入建议：先用 Shopify/3PL/ERP API 做标准连接器，再给 Postgres/MySQL 提供只读账号接入。所有来源先映射到 Product、Inventory、Sales Demand、Purchase Order、Supplier 和 Compliance File 六个核心对象。";
  }
  if (prompt.includes("合规") || lower.includes("compliance")) {
    return "当前高风险合规缺口来自 Sunny Textile 和 Pearl Plastics。建议先索要覆盖具体 SKU 的证书原件，再让 AI 复核供应商名称、有效期、标准编号和产品范围。";
  }
  return "我会把这个请求拆成三个检查：库存影响、在途 PO 影响、供应商合规影响。当前最值得先处理的是 HM-BAMBOO-SET，因为缺货和文件缺失叠加。";
}

function renderAll() {
  updateMetrics();
  renderTasks();
  renderRiskBoard();
  renderReplenishment();
  renderPurchaseOrders();
  renderDocuments();
  renderSuppliers();
  renderConnectors();
  renderDataModels();
  renderPipeline();
  renderMappings();
}

function bindEvents() {
  $$(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".nav-item").forEach((item) => item.classList.remove("active"));
      $$(".view").forEach((view) => view.classList.remove("active"));
      button.classList.add("active");
      $(`#${button.dataset.view}`).classList.add("active");
    });
  });

  $("#globalSearch").addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderAll();
  });

  $("#serviceLevel").addEventListener("input", (event) => {
    state.serviceLevel = Number(event.target.value);
    $("#serviceLevelValue").textContent = `${state.serviceLevel}%`;
    renderReplenishment();
    updateMetrics();
  });

  $$(".segmented button").forEach((button) => {
    button.addEventListener("click", () => {
      $$(".segmented button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      state.riskFilter = button.dataset.riskFilter;
      renderRiskBoard();
    });
  });

  document.body.addEventListener("click", (event) => {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.dataset.taskAction) showToast(`${target.dataset.taskAction}已准备好，等待你确认发送。`);
    if (target.dataset.po) showToast(`${target.dataset.po} 催办邮件草稿已生成。`);
    if (target.dataset.doc) showToast(`${target.dataset.doc} 的索要清单已生成。`);
    if (target.dataset.riskSku) showToast(`${target.dataset.riskSku} 的补货和合规处理建议已加入 Copilot。`);
    if (target.dataset.connector) showToast(`${target.dataset.connector} 连接器配置已打开。`);
  });

  $("#copilotForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const input = $("#copilotPrompt");
    const prompt = input.value.trim();
    if (!prompt) return;
    addMessage(prompt, "user");
    addMessage(generateCopilotResponse(prompt));
    input.value = "";
  });

  $("#autoPlanBtn").addEventListener("click", () => {
    addMessage("已生成今日行动计划：1. 催 Sunny Textile 确认 PO-1048；2. 向 Pearl Plastics 索要原产地声明；3. 给 Nova Components 生成追加 PO；4. 把 Harbor Loom 延迟升级给采购负责人。");
    showToast("行动计划已生成。");
  });

  $("#createPoBtn").addEventListener("click", () => showToast("已生成 5 条 PO 草稿，可按供应商合并发送。"));
  $("#addConnectorBtn").addEventListener("click", () => showToast("连接器向导已准备：选择来源、授权、字段映射、同步检查。"));
  $("#runSyncBtn").addEventListener("click", () => {
    addMessage("同步检查完成：8 个连接器中 4 个已连接，2 个可配置数据库，2 个需要授权或字段确认。建议先让商家接订单、库存、采购单三类数据。");
    showToast("同步检查已完成。");
  });
  $("#requestDocsBtn").addEventListener("click", () => showToast("已按供应商生成文件索要邮件。"));
  $("#simulateUploadBtn").addEventListener("click", () => {
    addMessage("AI 审核结果：上传文件覆盖 Sunny Textile，但证书产品范围未包含 HM-BAMBOO-SET，需要供应商补充 Annex 页。");
    showToast("AI 文件审核已完成。");
  });
  $("#refreshBrief").addEventListener("click", () => {
    renderAll();
    showToast("今日简报已刷新。");
  });
}

addMessage("早上好。今天建议先处理 4 件事：一个缺货+合规双风险、两个 PO 延迟、一个供应商文件缺口。");
bindEvents();
renderAll();
