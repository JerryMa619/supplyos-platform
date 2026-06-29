export function daysUntilStockout(sku) {
  return Math.floor(sku.stock / sku.dailySales);
}

export function recommendedQty(sku, serviceLevel = 95) {
  const serviceFactor = serviceLevel >= 98 ? 1.35 : serviceLevel >= 95 ? 1.2 : 1.05;
  const cycleDemand = sku.dailySales * (sku.leadTime + 30);
  return Math.ceil((cycleDemand * serviceFactor + sku.safetyStock - sku.stock) / 50) * 50;
}

const currencyMeta = {
  USD: { rate: 1, locale: "en-US" },
  GBP: { rate: 0.79, locale: "en-GB" },
  EUR: { rate: 0.92, locale: "de-DE" },
  CNY: { rate: 7.2, locale: "zh-CN" }
};

export function money(value, currency = "USD") {
  const config = currencyMeta[currency] || currencyMeta.USD;
  return new Intl.NumberFormat(config.locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(value * config.rate);
}

export function badgeClass(risk) {
  if (risk === "high" || risk === "高") return "high";
  if (risk === "medium" || risk === "中") return "medium";
  return "low";
}
