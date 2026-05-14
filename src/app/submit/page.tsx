'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { koreanNameToEnglish, CATEGORY_MAP, CATEGORY_LIST } from '@/lib/romanize';

export default function SubmitPage() {
  const [category, setCategory] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [dragover, setDragover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // 영문명 미리보기
  const englishName = authorName.trim() ? koreanNameToEnglish(authorName) : '';
  const categoryCode = category ? CATEGORY_MAP[category] : '';
  const storageFileName = categoryCode && englishName ? `${categoryCode}-${englishName}` : '';

  const handleFile = useCallback((selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      showToast('error', '이미지 파일만 업로드 가능합니다.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      showToast('error', '파일 크기는 10MB 이하여야 합니다.');
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(selectedFile);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragover(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) handleFile(droppedFile);
  }, [handleFile]);

  const handleSubmit = async () => {
    if (!category) return showToast('error', '공모파트를 선택해주세요.');
    if (!authorName.trim()) return showToast('error', '이름을 입력해주세요.');
    if (!file) return showToast('error', '이미지 파일을 첨부해주세요.');

    const koreanName = authorName.trim();
    const enName = koreanNameToEnglish(koreanName);
    const catCode = CATEGORY_MAP[category];

    if (!enName) return showToast('error', '이름을 올바르게 입력해주세요.');

    setIsSubmitting(true);

    try {
      // 중복 제출 체크 (한글 이름 기준)
      const { data: existing } = await supabase
        .from('submissions')
        .select('id')
        .eq('author_name_kr', koreanName)
        .maybeSingle();

      if (existing) {
        showToast('error', '이미 제출된 이름입니다. 1인 1작품만 제출 가능합니다.');
        setIsSubmitting(false);
        return;
      }

      // 영문 파일명 생성 (Supabase Storage용)
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const storagePath = `submissions/${catCode}-${enName}.${ext}`;

      // Supabase Storage에 업로드
      const { error: uploadError } = await supabase.storage
        .from('contest-submissions')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Public URL 가져오기
      const { data: urlData } = supabase.storage
        .from('contest-submissions')
        .getPublicUrl(storagePath);

      // DB에 레코드 삽입
      const { error: insertError } = await supabase
        .from('submissions')
        .insert({
          category: catCode,
          author_name: enName,
          author_name_kr: koreanName,
          image_url: urlData.publicUrl,
          file_name: `${catCode}-${enName}.${ext}`,
        });

      if (insertError) throw insertError;

      showToast('success', '콘텐츠가 성공적으로 제출되었습니다! 🎉');
      setCategory('');
      setAuthorName('');
      setFile(null);
      setPreview(null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : '제출 중 오류가 발생했습니다.';
      showToast('error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              콘텐츠 제출
            </span>
          </h1>
          <p className="text-white/40 text-sm">AI 청렴 콘텐츠 공모전 작품을 제출합니다</p>
        </div>

        {/* Form */}
        <div className="glass-card-static p-8 animate-fade-in-up animate-delay-200">
          {/* Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/60 mb-2">공모파트</label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="glass-select"
              >
                <option value="">공모파트를 선택하세요</option>
                {CATEGORY_LIST.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/30">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </div>
            </div>
          </div>

          {/* Author Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/60 mb-2">이름</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="이름을 입력하세요 (한글)"
              className="glass-input"
            />
            {englishName && (
              <p className="text-xs text-white/25 mt-1.5 ml-1">
                영문 변환: <span className="text-indigo-400/60">{englishName}</span>
              </p>
            )}
          </div>

          {/* File Upload */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-white/60 mb-2">이미지 파일</label>
            <div
              className={`upload-zone ${dragover ? 'dragover' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragover(true); }}
              onDragLeave={() => setDragover(false)}
              onDrop={handleDrop}
            >
              {preview ? (
                <div className="space-y-4">
                  <img
                    src={preview}
                    alt="미리보기"
                    className="max-h-64 mx-auto rounded-lg object-contain"
                  />
                  <p className="text-sm text-white/40">{file?.name}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                      setPreview(null);
                    }}
                    className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
                  >
                    파일 제거
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400/60">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" x2="12" y1="3" y2="15" />
                    </svg>
                  </div>
                  <p className="text-white/40 text-sm">
                    클릭하거나 파일을 드래그하여 업로드
                  </p>
                  <p className="text-white/20 text-xs">
                    PNG, JPG, WEBP, GIF (최대 10MB)
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
              className="hidden"
            />
          </div>

          {/* File name preview (Storage 경로) */}
          {storageFileName && (
            <div className="mb-6 p-3 rounded-lg bg-white/3 border border-white/5">
              <span className="text-xs text-white/30">파일명: </span>
              <span className="text-sm text-indigo-400/80">{storageFileName}</span>
              <span className="text-xs text-white/15 ml-2">({category}_{authorName.trim()})</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="glass-btn w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-3">
                <span className="spinner" />
                제출 중...
              </span>
            ) : (
              <span className="relative z-10 flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" x2="12" y1="3" y2="15" />
                </svg>
                제출하기
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
