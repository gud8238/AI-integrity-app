'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className={`text-center max-w-3xl mx-auto transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 animate-fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-white/60">2026년도 공모전 진행 중</span>
        </div>

        {/* Institution */}
        <p className="text-white/40 text-sm tracking-widest uppercase mb-4 animate-fade-in-up animate-delay-100">
          전라남도교육청창의융합교육원
        </p>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in-up animate-delay-200">
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            AI 청렴 콘텐츠
          </span>
          <br />
          <span className="text-white/90">공모전</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-white/50 mb-4 leading-relaxed animate-fade-in-up animate-delay-300">
          자발적인 청렴활동 실천 및 청렴한 조직문화 확산을 위한
        </p>
        <p className="text-base text-white/30 mb-12 animate-fade-in-up animate-delay-400">
          청렴표어 · 청렴사진 · 청렴캐릭터 · 청렴시
        </p>

        {/* CTA Button */}
        <div className="animate-fade-in-up animate-delay-500">
          <Link
            href="/info"
            className="glass-btn text-lg px-10 py-4"
          >
            <span className="relative z-10 flex items-center gap-3">
              접속하기
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </span>
          </Link>
        </div>

        {/* Deadline Info */}
        <div className="mt-16 animate-fade-in-up animate-delay-600">
          <div className="inline-flex items-center gap-3 glass-card-static px-6 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-sm text-white/40">
              접수기간: 2026. 5. 18.(월) 14:00, 교육정보부 AI·디지털 아카데미 운영 시간 내
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
