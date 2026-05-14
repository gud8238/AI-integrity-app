/**
 * 한글 이름을 Revised Romanization 방식으로 영문 변환
 * 예: 서찬아 → chanaseo (성+이름 → 이름+성 순서, 소문자)
 */

// 초성 (19개)
const INITIALS = [
  'g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp',
  's', 'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h',
];

// 중성 (21개)
const MEDIALS = [
  'a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye',
  'o', 'wa', 'wae', 'oe', 'yo', 'u', 'wo', 'we',
  'wi', 'yu', 'eu', 'ui', 'i',
];

// 종성 (28개, 첫 번째는 없음)
const FINALS = [
  '', 'k', 'k', 'k', 'n', 'n', 'n', 't',
  'l', 'l', 'l', 'l', 'l', 'l', 'l', 'l',
  'm', 'p', 'p', 't', 't', 'ng', 't', 't',
  'k', 't', 'p', 't',
];

/**
 * 단일 한글 문자를 로마자로 변환
 */
function romanizeChar(char: string): string {
  const code = char.charCodeAt(0);

  // 한글 범위 (가 ~ 힣)
  if (code < 0xac00 || code > 0xd7a3) {
    return char;
  }

  const offset = code - 0xac00;
  const initialIndex = Math.floor(offset / (21 * 28));
  const medialIndex = Math.floor((offset % (21 * 28)) / 28);
  const finalIndex = offset % 28;

  return INITIALS[initialIndex] + MEDIALS[medialIndex] + FINALS[finalIndex];
}

/**
 * 한글 문자열을 로마자로 변환 (소문자)
 */
function romanizeKorean(text: string): string {
  return Array.from(text)
    .map(romanizeChar)
    .join('')
    .toLowerCase();
}

/**
 * 한글 이름을 영문명으로 변환
 * 규칙: 성(1글자) + 이름(나머지) → 이름로마자 + 성로마자 (소문자, 공백 없음)
 * 예: 서찬아 → chanaseo, 이정민 → jeongminri (→ actually jeongminlee? no, 이 = i → ri? no)
 * 
 * Actually let's do: 서 = seo, 찬아 = chana → chanaseo
 * 이 = i but as initial ㅇ+ㅣ → "i", 정민 = jeongmin → jeongmini
 * 
 * Hmm, Korean surname "이" romanizes to "i" or "lee" in practice.
 * Let's use standard romanization and just concatenate: givenname + surname
 */
export function koreanNameToEnglish(koreanName: string): string {
  const trimmed = koreanName.trim();
  if (trimmed.length === 0) return '';

  // 한글이 아닌 경우 그대로 반환
  if (!/[가-힣]/.test(trimmed)) {
    return trimmed.replace(/\s+/g, '').toLowerCase();
  }

  if (trimmed.length === 1) {
    return romanizeKorean(trimmed);
  }

  // 성(1글자) + 이름(나머지)
  const surname = trimmed.charAt(0);
  const givenName = trimmed.slice(1);

  // 이름 + 성 순서로 결합 (소문자, 공백 없음)
  const romanizedGiven = romanizeKorean(givenName);
  const romanizedSurname = romanizeKorean(surname);

  return (romanizedGiven + romanizedSurname).replace(/\s+/g, '');
}

/**
 * 카테고리 한글명 → 코드
 */
export const CATEGORY_MAP: Record<string, string> = {
  '청렴표어': 'p1',
  '청렴사진': 'p2',
  '청렴캐릭터': 'p3',
  '청렴시': 'p4',
};

/**
 * 카테고리 코드 → 한글명
 */
export const CATEGORY_REVERSE: Record<string, string> = {
  'p1': '청렴표어',
  'p2': '청렴사진',
  'p3': '청렴캐릭터',
  'p4': '청렴시',
};

export const CATEGORY_LIST = ['청렴표어', '청렴사진', '청렴캐릭터', '청렴시'] as const;
