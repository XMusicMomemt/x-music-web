import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerif = Noto_Serif_SC({
  variable: "--font-noto-serif",
  weight: ["600", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "音乐瞬间 · 音乐教师认证官方平台",
  description:
    "音乐瞬间（MUSIC MOMENT）是音乐教师认证的官方主体：在线提交认证申请，经资质审核与专业试讲后，认证教师将在官网公开展示，帮助家长与学员找到值得信赖的音乐老师。",
  keywords: ["音乐瞬间", "音乐老师认证", "音乐教师认证", "认证申请", "音乐教育", "钢琴老师", "声乐老师"],
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSerif.variable} font-sans antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
