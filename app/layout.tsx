import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Office UI マスター",
  description: "Microsoft OfficeのUI操作を学習するゲーム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
