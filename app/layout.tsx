import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { COMPANY } from "@/lib/company";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TinyCRM TW — 小型 CRM",
  description: "小型 CRM・手機優先・LINE 備註・Excel 匯出",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="mt-auto border-t border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto max-w-5xl space-y-2 px-4 py-6 text-xs text-zinc-500 sm:px-8">
            <nav className="flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/pricing" className="hover:underline">方案與定價</Link>
              <Link href="/terms" className="hover:underline">服務條款</Link>
              <Link href="/privacy" className="hover:underline">隱私權政策</Link>
              <Link href="/refund" className="hover:underline">退款政策</Link>
            </nav>
            <p>
              © {new Date().getFullYear()} {COMPANY.name}｜統一編號：{COMPANY.taxId}｜{COMPANY.address}
            </p>
            <p>
              Email：
              <a href={`mailto:${COMPANY.email}`} className="hover:underline">
                {COMPANY.email}
              </a>
              ｜LINE：{COMPANY.lineId}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
