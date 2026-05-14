'use client';

import { useState, useEffect } from 'react';
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
  submission_id: string;
  theme_score: number;
  creativity_score: number;
  ai_usage_score: number;
  delivery_score: number;
  total_score: number;
  ranking: number;
  review_comment: string;
}

interface SubmissionWithResult extends Submission {
  result?: JudgeResult;
}

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [submissions, setSubmissions] = useState<SubmissionWithResult[]>([]);
  const [judging, setJudging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [judgeCompleted, setJudgeCompleted] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Check if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        loadSubmissions();
      }
    });
  }, []);

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      setIsLoggedIn(true);
      loadSubmissions();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '로그인에 실패했습니다.';
      setLoginError(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setSubmissions([]);
  };

  const loadSubmissions = async () => {
    setLoadingData(true);
    try {
      // Fetch all submissions
      const { data: subs, error: subsError } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: true });

      if (subsError) throw subsError;

      // Fetch all results
      const { data: results, error: resultsError } = await supabase
        .from('judge_results')
        .select('*');

      if (resultsError) throw resultsError;

      // Merge
      const merged = (subs || []).map((sub: Submission) => ({
        ...sub,
        result: (results || []).find((r: JudgeResult) => r.submission_id === sub.id),
      }));

      setSubmissions(merged);

      // Check if all judged
      if (results && results.length > 0 && subs && results.length === subs.length) {
        setJudgeCompleted(true);
      }
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleJudge = async () => {
    if (submissions.length === 0) return;

    setJudging(true);
    setProgress(0);
    setProgressTotal(submissions.length);
    setJudgeCompleted(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('인증이 필요합니다.');

      const response = await fetch('/api/judge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '심사 중 오류가 발생했습니다.');
      }

      // Stream progress via reader
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.progress) setProgress(data.progress);
                if (data.total) setProgressTotal(data.total);
                if (data.completed) setJudgeCompleted(true);
              } catch {
                // skip invalid JSON
              }
            }
          }
        }
      }

      // Reload submissions with results
      await loadSubmissions();
      setJudgeCompleted(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '심사 중 오류가 발생했습니다.';
      alert(errorMessage);
    } finally {
      setJudging(false);
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

  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (a.result && b.result) return (a.result.ranking || 999) - (b.result.ranking || 999);
    if (a.result) return -1;
    if (b.result) return 1;
    return 0;
  });

  // Login Form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-md animate-fade-in-up">
          <div className="text-center mb-8">
            <Link href="/info" className="text-sm text-white/25 hover:text-white/50 transition-colors mb-6 inline-block">
              ← 공모전 안내로 돌아가기
            </Link>
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white/90 mb-2">심사자 로그인</h1>
            <p className="text-white/40 text-sm">AI 심사를 진행하려면 심사자 계정으로 로그인하세요</p>
          </div>

          <div className="glass-card-static p-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="admin01@inter.app"
                  className="glass-input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="비밀번호를 입력하세요"
                  className="glass-input"
                />
              </div>

              {loginError && (
                <p className="text-red-400/80 text-sm">{loginError}</p>
              )}

              <button
                onClick={handleLogin}
                disabled={loginLoading}
                className="glass-btn w-full py-4 mt-2"
              >
                {loginLoading ? (
                  <span className="flex items-center gap-3">
                    <span className="spinner" /> 로그인 중...
                  </span>
                ) : (
                  <span className="relative z-10">로그인</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-extrabold mb-1">
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                AI 심사 대시보드
              </span>
            </h1>
            <p className="text-white/40 text-sm">제출된 콘텐츠를 확인하고 AI 심사를 진행합니다</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30 hidden sm:block">심사자 계정</span>
            <button onClick={handleLogout} className="glass-btn glass-btn-secondary px-4 py-2 text-sm">
              로그아웃
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-up animate-delay-100">
          <div className="glass-card-static p-5 text-center">
            <p className="text-2xl font-bold text-white/90">{submissions.length}</p>
            <p className="text-xs text-white/30 mt-1">전체 제출</p>
          </div>
          <div className="glass-card-static p-5 text-center">
            <p className="text-2xl font-bold text-emerald-400">{submissions.filter(s => s.result).length}</p>
            <p className="text-xs text-white/30 mt-1">심사 완료</p>
          </div>
          <div className="glass-card-static p-5 text-center">
            <p className="text-2xl font-bold text-amber-400">{submissions.filter(s => !s.result).length}</p>
            <p className="text-xs text-white/30 mt-1">심사 대기</p>
          </div>
          <div className="glass-card-static p-5 text-center">
            <p className="text-2xl font-bold text-indigo-400">
              {new Set(submissions.map(s => s.category)).size}
            </p>
            <p className="text-xs text-white/30 mt-1">카테고리</p>
          </div>
        </div>

        {/* Judge Button & Progress */}
        <div className="glass-card-static p-6 mb-8 animate-fade-in-up animate-delay-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white/80">AI 심사 실행</h2>
            {judgeCompleted && (
              <span className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                심사 완료
              </span>
            )}
          </div>

          {judging && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-white/40 mb-2">
                <span>심사 진행 중...</span>
                <span>{progress} / {progressTotal}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: progressTotal ? `${(progress / progressTotal) * 100}%` : '0%' }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleJudge}
            disabled={judging || submissions.length === 0}
            className="glass-btn glass-btn-success w-full py-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {judging ? (
              <span className="flex items-center gap-3">
                <span className="spinner" /> AI 심사 진행 중... ({progress}/{progressTotal})
              </span>
            ) : (
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
                </svg>
                {judgeCompleted ? 'AI 재심사하기' : 'AI 심사하기'}
              </span>
            )}
          </button>
        </div>

        {/* Submissions Grid / Results Table */}
        {loadingData ? (
          <div className="flex items-center justify-center py-20">
            <span className="spinner" />
            <span className="ml-3 text-white/40">불러오는 중...</span>
          </div>
        ) : submissions.length === 0 ? (
          <div className="glass-card-static p-12 text-center animate-fade-in-up">
            <p className="text-white/30 text-lg">아직 제출된 콘텐츠가 없습니다.</p>
          </div>
        ) : judgeCompleted ? (
          /* Results Ranking Table */
          <div className="glass-card-static p-6 animate-fade-in-up animate-delay-300 overflow-x-auto">
            <h2 className="text-lg font-bold text-white/80 mb-6">🏆 심사 결과 랭킹</h2>
            <table className="glass-table">
              <thead>
                <tr>
                  <th className="text-center">등수</th>
                  <th>콘텐츠</th>
                  <th>작성자</th>
                  <th>카테고리</th>
                  <th className="text-center">주제적합성<br /><span className="text-white/20">/30</span></th>
                  <th className="text-center">창의성<br /><span className="text-white/20">/25</span></th>
                  <th className="text-center">AI활용도<br /><span className="text-white/20">/25</span></th>
                  <th className="text-center">전달력<br /><span className="text-white/20">/20</span></th>
                  <th className="text-center">총점<br /><span className="text-white/20">/100</span></th>
                  <th>심사평</th>
                </tr>
              </thead>
              <tbody>
                {sortedSubmissions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="text-center">
                      {sub.result?.ranking && (
                        <span className={`rank-badge text-sm ${getRankBadge(sub.result.ranking)}`}>
                          {sub.result.ranking}
                        </span>
                      )}
                    </td>
                    <td>
                      <img
                        src={sub.image_url}
                        alt={sub.file_name}
                        className="w-16 h-16 rounded-lg object-cover border border-white/5"
                      />
                    </td>
                    <td className="font-medium text-white/80">{sub.author_name_kr || sub.author_name}</td>
                    <td>
                      <span className="px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400/80 text-xs">
                        {CATEGORY_REVERSE[sub.category] || sub.category}
                      </span>
                    </td>
                    <td className="text-center">
                      {sub.result && (
                        <span className={`score-badge ${getScoreClass(sub.result.theme_score, 30)}`}>
                          {sub.result.theme_score}
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      {sub.result && (
                        <span className={`score-badge ${getScoreClass(sub.result.creativity_score, 25)}`}>
                          {sub.result.creativity_score}
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      {sub.result && (
                        <span className={`score-badge ${getScoreClass(sub.result.ai_usage_score, 25)}`}>
                          {sub.result.ai_usage_score}
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      {sub.result && (
                        <span className={`score-badge ${getScoreClass(sub.result.delivery_score, 20)}`}>
                          {sub.result.delivery_score}
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      {sub.result && (
                        <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                          {sub.result.total_score}
                        </span>
                      )}
                    </td>
                    <td className="max-w-xs">
                      <p className="text-xs text-white/50 leading-relaxed line-clamp-3">
                        {sub.result?.review_comment || '-'}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Submissions Grid (before judging) */
          <div className="animate-fade-in-up animate-delay-300">
            <h2 className="text-lg font-bold text-white/80 mb-6">📋 제출된 콘텐츠 ({submissions.length}건)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {submissions.map((sub, i) => (
                <div
                  key={sub.id}
                  className="glass-card p-4 animate-fade-in-up"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <div className="aspect-square rounded-xl overflow-hidden bg-black/20 border border-white/5 mb-3">
                    <img
                      src={sub.image_url}
                      alt={sub.file_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-white/80">{sub.author_name_kr || sub.author_name}</p>
                      <span className="text-xs text-indigo-400/60">{CATEGORY_REVERSE[sub.category] || sub.category}</span>
                    </div>
                    {sub.result ? (
                      <span className="score-badge score-excellent">{sub.result.total_score}</span>
                    ) : (
                      <span className="text-xs text-white/20">대기</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-10">
          <Link href="/info" className="text-sm text-white/25 hover:text-white/50 transition-colors">
            ← 공모전 안내로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
