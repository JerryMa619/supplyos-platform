import "./globals.css";

export const metadata = {
  title: "SupplyOS - AI 采购与供应商工作台",
  description: "AI supply chain operations platform for merchants",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
