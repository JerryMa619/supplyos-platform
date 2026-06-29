import "./globals.css";

export const metadata = {
  title: "SupplyOS - AI 采购与供应商工作台",
  description: "AI supply chain operations platform for merchants"
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
