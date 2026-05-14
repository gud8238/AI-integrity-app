'use client';

import Link from 'next/link';

const criteriaData = [
  {
    area: '주제 적합성',
    maxScore: 30,
    criteria: [
      '청렴·공정·반부패 가치가 잘 드러나는가?',
      '콘텐츠의 메시지가 명확하고 이해하기 쉬운가?',
      '전남교육 및 조직문화와의 연관성이 있는가?',
    ],
    scores: ['26~30', '21~25', '16~20', '6~15', '0~5'],
  },
  {
    area: '창의성',
    maxScore: 25,
    criteria: [
      '기존 청렴 콘텐츠와 차별화된 아이디어인가?',
      'AI를 활용한 표현 방식이 참신한가?',
      '흥미와 몰입감을 유도하는가?',
    ],
    scores: ['21~25', '16~20', '11~15', '6~10', '0~5'],
  },
  {
    area: 'AI 활용도',
    maxScore: 25,
    criteria: [
      '생성형 AI를 효과적으로 활용하였는가?',
      'AI 활용 목적과 표현이 자연스러운가?',
      'AI 기반 창작물의 완성도가 우수한가?',
    ],
    scores: ['21~25', '16~20', '11~15', '6~10', '0~5'],
  },
  {
    area: '전달력',
    maxScore: 20,
    criteria: [
      '청렴 문화 확산에 활용 가능성이 높은가?',
      '전시·홍보·SNS 콘텐츠 등으로 활용 가능한가?',
      '대중에게 쉽게 전달되고 기억에 남는가?',
    ],
    scores: ['17~20', '13~16', '9~12', '5~8', '0~4'],
  },
];

const awards = [
  { rank: '대상', count: '1명', prize: '국내 선진지 연수 출장 (2박3일)', icon: '🏆' },
  { rank: '최우수상', count: '1명', prize: '국내 선진지 연수 출장 (1박2일)', icon: '🥇' },
  { rank: '우수상', count: '2명', prize: '나주사랑상품권 5만원권', icon: '🥈' },
];

export default function InfoPage() {
  return (
    <div className="min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <p className="text-white/40 text-sm tracking-widest uppercase mb-3">
            전라남도교육청창의융합교육원
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              AI 청렴 콘텐츠 공모전
            </span>
          </h1>
          <p className="text-white/40 text-base">
            2026년도 AI를 이용한 청렴 콘텐츠 공모전 안내
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          {/* 공모내용 */}
          <div className="glass-card p-6 animate-fade-in-up animate-delay-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                  <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white/90">공모내용</h2>
            </div>
            <div className="space-y-2">
              {['청렴표어 (슬로건)', '청렴사진 (이미지)', '청렴캐릭터', '청렴시'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400/60" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
              <p className="text-xs text-white/30 mt-3 pt-3 border-t border-white/5">
                ※ 반드시 AI를 이용해서 직접 창작한 콘텐츠 (1인당 1개 신청 가능)
              </p>
            </div>
          </div>

          {/* 접수방법 */}
          <div className="glass-card p-6 animate-fade-in-up animate-delay-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white/90">접수방법</h2>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              창작 콘텐츠를 이미지 파일로 저장한 후,
              <br />본 웹앱의 <strong className="text-white/80">제출하기</strong> 페이지에서 업로드합니다.
            </p>
            <p className="text-xs text-white/30 mt-3 pt-3 border-t border-white/5">
              파일명: 공모부분_이름 (예: 청렴표어_홍길동)
            </p>
          </div>

          {/* 심사방법 */}
          <div className="glass-card p-6 animate-fade-in-up animate-delay-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                  <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white/90">심사방법</h2>
            </div>
            <p className="text-sm text-white/60 leading-relaxed">
              AI 심사프로그램 (Gemini 3.0 Flash)으로
              <br /><strong className="text-white/80">당일 심사</strong> 진행 (심사기준 별첨)
            </p>
            <p className="text-xs text-white/30 mt-3 pt-3 border-t border-white/5">
              이미지와 텍스트를 종합 분석하여 4개 영역 100점 만점으로 평가
            </p>
          </div>

          {/* 참가대상 & 접수기간 */}
          <div className="glass-card p-6 animate-fade-in-up animate-delay-400">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white/90">참가 안내</h2>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-white/30">참가대상</span>
                <p className="text-sm text-white/60">전 직원</p>
              </div>
              <div>
                <span className="text-xs text-white/30">접수기간</span>
                <p className="text-sm text-white/60">2026. 5. 18.(월) 14:00</p>
                <p className="text-xs text-white/40">교육정보부 AI·디지털 아카데미 운영 시간 내</p>
              </div>
            </div>
          </div>
        </div>

        {/* Awards Section */}
        <div className="glass-card-static p-8 mb-10 animate-fade-in-up animate-delay-500">
          <h2 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-lg">🏅</span>
            시상내용
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {awards.map((award, i) => (
              <div key={i} className="bg-white/3 rounded-2xl p-5 border border-white/5 text-center">
                <span className="text-3xl mb-3 block">{award.icon}</span>
                <h3 className="text-base font-bold text-white/90 mb-1">{award.rank}</h3>
                <p className="text-xs text-white/40 mb-2">{award.count}</p>
                <p className="text-sm text-white/60">{award.prize}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/25 mt-4 pt-4 border-t border-white/5">
            ※ 연수출장 후 연수보고서(자유서식) 작성하여 담당자(박은주) 업무메일로 제출
          </p>
        </div>

        {/* Criteria Table */}
        <div className="glass-card-static p-8 mb-12 animate-fade-in-up animate-delay-600">
          <h2 className="text-xl font-bold text-white/90 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
              </svg>
            </span>
            AI 청렴 콘텐츠 공모전 영역별 심사 기준
          </h2>
          <div className="overflow-x-auto">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>영역</th>
                  <th>평가 기준</th>
                  <th className="text-center">매우우수</th>
                  <th className="text-center">우수</th>
                  <th className="text-center">보통</th>
                  <th className="text-center">미흡</th>
                  <th className="text-center">매우미흡</th>
                </tr>
              </thead>
              <tbody>
                {criteriaData.map((row, i) => (
                  <tr key={i}>
                    <td className="font-semibold text-white/80 whitespace-nowrap">
                      {row.area}
                      <br />
                      <span className="text-xs text-indigo-400/80">({row.maxScore}점)</span>
                    </td>
                    <td>
                      <ul className="space-y-1">
                        {row.criteria.map((c, j) => (
                          <li key={j} className="flex items-start gap-2 text-white/50 text-sm">
                            <span className="text-indigo-400/60 mt-0.5">▸</span>
                            {c}
                          </li>
                        ))}
                      </ul>
                    </td>
                    {row.scores.map((score, j) => (
                      <td key={j} className="text-center text-white/50 text-sm whitespace-nowrap">
                        {score}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} className="text-right font-bold text-white/70 pt-4">합계</td>
                  <td colSpan={5} className="pt-4">
                    <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                      100점
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up">
          <Link href="/submit" className="glass-btn w-full sm:w-auto text-center px-8 py-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" />
            </svg>
            <span className="relative z-10">제출하기</span>
          </Link>
          <Link href="/results" className="glass-btn glass-btn-secondary w-full sm:w-auto text-center px-8 py-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <span className="relative z-10">심사결과 조회</span>
          </Link>
          <Link href="/admin" className="glass-btn glass-btn-accent w-full sm:w-auto text-center px-8 py-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
            </svg>
            <span className="relative z-10">AI 심사하기</span>
          </Link>
        </div>

        {/* Back link */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-white/25 hover:text-white/50 transition-colors">
            ← 메인으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
