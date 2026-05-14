import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 청렴 콘텐츠 공모전 | 전라남도교육청창의융합교육원",
  description: "2026년도 AI를 이용한 청렴 콘텐츠 공모전 - 청렴표어, 청렴사진, 청렴캐릭터, 청렴시 공모 및 AI 심사",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preconnect"
          href="https://cdn.jsdelivr.net"
          crossOrigin="anonymous"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {/* Animated Background */}
        <div className="animated-bg" aria-hidden="true">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="grid-overlay" aria-hidden="true" />

        {/* Content */}
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}
