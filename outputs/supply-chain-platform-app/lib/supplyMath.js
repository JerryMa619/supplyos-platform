export function daysUntilStockout(sku) {
  return Math.floor(sku.stock / sku.dailySales);
}

export function recommendedQty(sku, serviceLevel = 95) {
  const serviceFactor = serviceLevel >= 98 ? 1.35 : serviceLevel >= 95 ? 1.2 : 1.05;
  const cycleDemand = sku.dailySales * (sku.leadTime + 30);
  return Math.ceil((cycleDemand * serviceFactor + sku.safetyStock - sku.stock) / 50) * 50;
}

export function money(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

export function badgeClass(risk) {
  if (risk === "high" || risk === "高") return "high";
  if (risk === "medium" || risk === "中") return "medium";
  return "low";
}
