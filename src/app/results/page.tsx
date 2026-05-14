'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { CATEGORY_REVERSE } from '@/lib/romanize';

interface Submission {
  id: string;
  category: string;
  author_name: string;
  author_name_kr: string;
  image_url: string;
  file_name: string;
  created_at: string;
}

interface JudgeResult {
  theme_score: number;
  creativity_score: number;
  ai_usage_score: number;
  delivery_score: number;
  total_score: number;
  ranking: number;
  review_comment: string;
  judged_at: string;
}

export default function ResultsPage() {
  const [searchName, setSearchName] = useState('');
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [result, setResult] = useState<JudgeResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchName.trim()) return;
    setLoading(true);
    setSearched(true);
    setShowResult(false);
    setResult(null);

    try {
      // 한글 이름으로 검색 (author_name_kr 컬럼)
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('author_name_kr', searchName.trim())
        .maybeSingle();

      if (error) throw error;
      setSubmission(data);
    } catch {
      setSubmission(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckResult = async () => {
    if (!submission) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('judge_results')
        .select('*')
        .eq('submission_id', submission.id)
        .maybeSingle();

      if (error) throw error;
      setResult(data);
      setShowResult(true);
    } catch {
      setResult(null);
      setShowResult(true);
    } finally {
      setLoading(false);
    }
  };

  const getScoreClass = (score: number, max: number) => {
    const pct = score / max;
    if (pct >= 0.85) return 'score-excellent';
    if (pct >= 0.7) return 'score-good';
    if (pct >= 0.5) return 'score-average';
    return 'score-poor';
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return 'rank-1';
    if (rank === 2) return 'rank-2';
    if (rank === 3) return 'rank-3';
    return 'bg-white/10 text-white/60';
  };

  // 카테고리 코드 → 한글 표시명
  const getCategoryLabel = (code: string) => CATEGORY_REVERSE[code] || code;

  return (
    <div className="min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <Link href="/info" className="text-sm text-white/25 hover:text-white/50 transition-colors mb-6 inline-block">
            ← 공모전 안내로 돌아가기
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              심사결과 조회
            </span>
          </h1>
          <p className="text-white/40 text-sm">이름을 입력하여 제출한 콘텐츠와 심사결과를 확인합니다</p>
        </div>

        {/* Search */}
        <div className="glass-card-static p-8 mb-8 animate-fade-in-up animate-delay-200">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="한글 이름을 입력하세요"
              className="glass-input flex-1"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="glass-btn px-6 shrink-0"
            >
              {loading ? <span className="spinner" /> : '조회'}
            </button>
          </div>
        </div>

        {/* Results */}
        {searched && (
          <div className="animate-fade-in-up">
            {!submission ? (
              <div className="glass-card-static p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/20">
                    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <p className="text-white/40">해당 이름으로 제출된 콘텐츠가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Submission Info */}
                <div className="glass-card-static p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-400 text-xs font-medium">
                      {getCategoryLabel(submission.category)}
                    </span>
                    <span className="text-white/70 font-semibold">
                      {submission.author_name_kr || submission.author_name}
                    </span>
                    <span className="text-white/20 text-xs ml-auto">
                      {new Date(submission.created_at).toLocaleString('ko-KR')}
                    </span>
                  </div>
                  <div className="rounded-xl overflow-hidden bg-black/20 border border-white/5">
                    <img
                      src={submission.image_url}
                      alt={submission.file_name}
                      className="w-full max-h-96 object-contain"
                    />
                  </div>
                  <p className="text-xs text-white/20 mt-3">{submission.file_name}</p>
                </div>

                {/* Check Result Button */}
                {!showResult && (
                  <button
                    onClick={handleCheckResult}
                    disabled={loading}
                    className="glass-btn glass-btn-accent w-full py-4"
                  >
                    {loading ? (
                      <span className="flex items-center gap-3">
                        <span className="spinner" /> 조회 중...
                      </span>
                    ) : (
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 20h9" /><path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
                        </svg>
                        심사결과 확인
                      </span>
                    )}
                  </button>
                )}

                {/* Result Display */}
                {showResult && (
                  <div className="glass-card-static p-8 animate-fade-in-up">
                    {!result ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400/60">
                            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                          </svg>
                        </div>
                        <p className="text-amber-400/80 text-lg font-semibold mb-2">아직 심사 전입니다</p>
                        <p className="text-white/30 text-sm">심사가 완료되면 이곳에서 결과를 확인할 수 있습니다.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {/* Ranking & Total */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`rank-badge ${getRankBadge(result.ranking)}`}>
                              {result.ranking}
                            </div>
                            <div>
                              <p className="text-xs text-white/30">등수</p>
                              <p className="text-white/70 font-semibold">{result.ranking}위</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-white/30">총점</p>
                            <p className="text-3xl font-extrabold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                              {result.total_score}
                              <span className="text-sm text-white/30 ml-1">/100</span>
                            </p>
                          </div>
                        </div>

                        <hr className="border-white/5" />

                        {/* Score Breakdown */}
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: '주제 적합성', score: result.theme_score, max: 30 },
                            { label: '창의성', score: result.creativity_score, max: 25 },
                            { label: 'AI 활용도', score: result.ai_usage_score, max: 25 },
                            { label: '전달력', score: result.delivery_score, max: 20 },
                          ].map((item) => (
                            <div key={item.label} className="bg-white/3 rounded-xl p-4 border border-white/5">
                              <p className="text-xs text-white/30 mb-2">{item.label}</p>
                              <div className="flex items-end gap-2">
                                <span className={`score-badge ${getScoreClass(item.score, item.max)}`}>
                                  {item.score}
                                </span>
                                <span className="text-xs text-white/20">/ {item.max}</span>
                              </div>
                              <div className="progress-bar mt-2">
                                <div
                                  className="progress-fill"
                                  style={{ width: `${(item.score / item.max) * 100}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Review Comment */}
                        {result.review_comment && (
                          <div className="bg-white/3 rounded-xl p-5 border border-white/5">
                            <p className="text-xs text-white/30 mb-2">💬 AI 심사평</p>
                            <p className="text-sm text-white/60 leading-relaxed">
                              {result.review_comment}
                            </p>
                          </div>
                        )}

                        <p className="text-xs text-white/15 text-right">
                          심사일시: {new Date(result.judged_at).toLocaleString('ko-KR')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
