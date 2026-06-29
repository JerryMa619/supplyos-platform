export const skus = [
  {
    id: "HM-BAMBOO-SET",
    name: "Bamboo Bedding Set",
    stock: 412,
    dailySales: 44,
    leadTime: 28,
    safetyStock: 260,
    supplier: "Sunny Textile",
    unitCost: 18.4,
    compliance: "missing"
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
    compliance: "expiring"
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
    compliance: "ok"
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
    compliance: "missing"
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
    compliance: "expiring"
  }
];

export const purchaseOrders = [
  { id: "PO-1048", supplier: "Sunny Textile", sku: "HM-BAMBOO-SET", qty: 2400, eta: "2026-07-18", status: "待确认", delay: 5 },
  { id: "PO-1051", supplier: "Harbor Loom", sku: "HM-LINEN-02", qty: 1200, eta: "2026-07-24", status: "已延迟", delay: 11 },
  { id: "PO-1056", supplier: "Nova Components", sku: "EL-CABLE-USB4", qty: 6000, eta: "2026-07-10", status: "在途", delay: 0 },
  { id: "PO-1060", supplier: "Pearl Plastics", sku: "HM-STORAGE-XL", qty: 1800, eta: "2026-07-21", status: "缺 ASN", delay: 4 }
];

export const documents = [
  { name: "OEKO-TEX Certificate", supplier: "Sunny Textile", sku: "HM-BAMBOO-SET", status: "缺失", risk: "high", due: "立即" },
  { name: "Material Declaration", supplier: "Harbor Loom", sku: "HM-LINEN-02", status: "15 天后过期", risk: "medium", due: "2026-07-14" },
  { name: "CE Test Report", supplier: "Nova Components", sku: "EL-CABLE-USB4", status: "有效", risk: "low", due: "2027-02-03" },
  { name: "Origin Statement", supplier: "Pearl Plastics", sku: "HM-STORAGE-XL", status: "缺失", risk: "high", due: "立即" },
  { name: "Cotton Source Declaration", supplier: "Sunny Textile", sku: "HM-TOWEL-WAFFLE", status: "9 天后过期", risk: "medium", due: "2026-07-08" }
];

export const suppliers = [
  { name: "Sunny Textile", onTime: 78, docs: 62, cost: "稳定", response: "18h", risk: "高", score: 69 },
  { name: "Harbor Loom", onTime: 71, docs: 74, cost: "+4.2%", response: "9h", risk: "中", score: 73 },
  { name: "Nova Components", onTime: 92, docs: 96, cost: "-1.1%", response: "4h", risk: "低", score: 91 },
  { name: "Pearl Plastics", onTime: 81, docs: 55, cost: "+2.8%", response: "22h", risk: "高", score: 66 },
  { name: "Evergreen Pack", onTime: 88, docs: 89, cost: "稳定", response: "6h", risk: "低", score: 86 }
];

export const connectors = [
  { name: "Shopify", type: "Commerce", status: "已连接", cadence: "每 30 分钟", scope: "订单、商品、库存", health: "low" },
  { name: "Amazon Seller", type: "Marketplace", status: "待授权", cadence: "OAuth", scope: "销售、FBA 库存", health: "medium" },
  { name: "PostgreSQL", type: "Database", status: "可配置", cadence: "只读副本", scope: "SKU、PO、供应商", health: "low" },
  { name: "MySQL", type: "Database", status: "可配置", cadence: "SSH 隧道", scope: "库存、入库、发票", health: "low" },
  { name: "NetSuite", type: "ERP", status: "映射中", cadence: "每 2 小时", scope: "采购单、账期、收货", health: "medium" },
  { name: "QuickBooks", type: "Accounting", status: "已连接", cadence: "每日", scope: "成本、供应商账款", health: "low" },
  { name: "ShipBob 3PL", type: "Warehouse", status: "已连接", cadence: "每小时", scope: "仓库库存、出入库", health: "low" },
  { name: "Supplier Portal", type: "Documents", status: "内测", cadence: "实时", scope: "证书、产地、测试报告", health: "medium" }
];

export const dataModels = [
  { name: "Product & SKU", owner: "商品主数据", fields: ["sku", "barcode", "category", "unit_cost", "supplier_id"] },
  { name: "Inventory", owner: "库存事实表", fields: ["sku", "warehouse", "on_hand", "available", "inbound_qty"] },
  { name: "Sales Demand", owner: "需求信号", fields: ["sku", "channel", "order_date", "qty", "net_sales"] },
  { name: "Purchase Order", owner: "采购执行", fields: ["po_id", "supplier_id", "sku", "qty", "eta", "status"] },
  { name: "Supplier", owner: "供应商档案", fields: ["supplier_id", "lead_time", "moq", "payment_terms", "country"] },
  { name: "Compliance File", owner: "合规证据", fields: ["document_id", "sku", "supplier_id", "expires_at", "coverage"] }
];

export const pipelineSteps = [
  { title: "连接", detail: "OAuth、API key、只读数据库账号或 SFTP。", status: "安全边界" },
  { title: "抽取", detail: "增量同步订单、库存、PO、供应商和文件元数据。", status: "CDC/定时" },
  { title: "映射", detail: "把商家字段映射到标准供应链模型。", status: "可复核" },
  { title: "质检", detail: "检测缺字段、重复 SKU、负库存、异常 lead time。", status: "自动" },
  { title: "生成洞察", detail: "刷新补货建议、PO 催办、合规缺口和供应商评分。", status: "AI 工作台" }
];

export const fieldMappings = [
  { source: "shopify.variant.sku", target: "product.sku", object: "Product & SKU", check: "不能为空", status: "已匹配" },
  { source: "inventory.available", target: "inventory.available", object: "Inventory", check: "不允许负数", status: "已匹配" },
  { source: "po.expected_arrival", target: "purchase_order.eta", object: "Purchase Order", check: "日期格式", status: "需确认" },
  { source: "vendor.lead_days", target: "supplier.lead_time", object: "Supplier", check: "1-180 天", status: "已匹配" },
  { source: "document.expiry", target: "compliance_file.expires_at", object: "Compliance File", check: "过期提醒", status: "需确认" }
];
