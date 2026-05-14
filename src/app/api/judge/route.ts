import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';

const JUDGE_PROMPT = `당신은 "AI 청렴 콘텐츠 공모전"의 전문 심사위원입니다.
제출된 콘텐츠(이미지와 이미지 속에 포함된 텍스트/슬로건)를 종합적으로 분석하여 아래 심사기준에 따라 정확하게 평가해주세요.

## 심사기준 (총 100점)

### 1. 주제 적합성 (30점)
- 청렴·공정·반부패 가치가 잘 드러나는가?
- 콘텐츠의 메시지가 명확하고 이해하기 쉬운가?
- 전남교육 및 조직문화와의 연관성이 있는가?
배점: 매우우수(26~30), 우수(21~25), 보통(16~20), 미흡(6~15), 매우미흡(0~5)

### 2. 창의성 (25점)
- 기존 청렴 콘텐츠와 차별화된 아이디어인가?
- AI를 활용한 표현 방식이 참신한가?
- 흥미와 몰입감을 유도하는가?
배점: 매우우수(21~25), 우수(16~20), 보통(11~15), 미흡(6~10), 매우미흡(0~5)

### 3. AI 활용도 (25점)
- 생성형 AI를 효과적으로 활용하였는가?
- AI 활용 목적과 표현이 자연스러운가?
- AI 기반 창작물의 완성도가 우수한가?
배점: 매우우수(21~25), 우수(16~20), 보통(11~15), 미흡(6~10), 매우미흡(0~5)

### 4. 전달력 (20점)
- 청렴 문화 확산에 활용 가능성이 높은가?
- 전시·홍보·SNS 콘텐츠 등으로 활용 가능한가?
- 대중에게 쉽게 전달되고 기억에 남는가?
배점: 매우우수(17~20), 우수(13~16), 보통(9~12), 미흡(5~8), 매우미흡(0~4)

## 중요 지침
- 이미지 속의 텍스트(슬로건, 문구 등)도 반드시 읽고 분석하세요.
- 이미지의 시각적 품질, 구성, 색감 등도 평가에 반영하세요.
- 각 영역의 점수는 반드시 해당 배점 범위 내에서 부여하세요.
- 심사평은 한국어로 2~3문장으로 작성하되, 콘텐츠의 강점과 개선점을 포함하세요.
- total_score는 반드시 네 영역 점수의 합이어야 합니다.

## 응답 형식 (반드시 아래 JSON 형식으로만 응답)
{
  "theme_score": <0~30 정수>,
  "creativity_score": <0~25 정수>,
  "ai_usage_score": <0~25 정수>,
  "delivery_score": <0~20 정수>,
  "total_score": <0~100 정수>,
  "review_comment": "<한국어 심사평 2~3문장>"
}`;
export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL']!;
    const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY']!;
    const geminiApiKey = process.env['GEMINI_API_KEY'];

    // Verify auth
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return Response.json({ error: '인증이 필요합니다.' }, { status: 401 });
    }

    if (!geminiApiKey) {
      return Response.json({ error: '서버 환경 변수에 GEMINI_API_KEY가 설정되지 않았습니다. Netlify 대시보드에서 추가해주세요.' }, { status: 400 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return Response.json({ error: '인증에 실패했습니다.' }, { status: 401 });
    }

    // Get all submissions
    const { data: submissions, error: subError } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: true });

    if (subError || !submissions || submissions.length === 0) {
      return Response.json({ error: '제출된 콘텐츠가 없습니다.' }, { status: 400 });
    }

    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    // Use streaming response for progress
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const BATCH_SIZE = 5; // Process 5 submissions concurrently
        const results: Array<{
          submission_id: string;
          theme_score: number;
          creativity_score: number;
          ai_usage_score: number;
          delivery_score: number;
          total_score: number;
          review_comment: string;
          _originalIndex: number;
        }> = [];

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ total: submissions.length, progress: 0 })}\n\n`));

        // Helper: judge a single submission
        async function judgeOne(sub: Record<string, string>, index: number) {
          try {
            // Fetch image as base64
            const imageResponse = await fetch(sub.image_url);
            const imageBuffer = await imageResponse.arrayBuffer();
            const base64Image = Buffer.from(imageBuffer).toString('base64');
            const mimeType = imageResponse.headers.get('content-type') || 'image/png';

            // Call Gemini with image
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      inlineData: {
                        mimeType,
                        data: base64Image,
                      },
                    },
                    {
                      text: `${JUDGE_PROMPT}\n\n이 콘텐츠의 카테고리: ${sub.category}\n제출자: ${sub.author_name}\n\n위 이미지를 심사해주세요. JSON으로만 응답하세요.`,
                    },
                  ],
                },
              ],
            });

            // Parse response
            let responseText = response.text || '';
            const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (jsonMatch) {
              responseText = jsonMatch[1].trim();
            }

            const scores = JSON.parse(responseText);

            const theme = Math.min(30, Math.max(0, Math.round(scores.theme_score)));
            const creativity = Math.min(25, Math.max(0, Math.round(scores.creativity_score)));
            const aiUsage = Math.min(25, Math.max(0, Math.round(scores.ai_usage_score)));
            const delivery = Math.min(20, Math.max(0, Math.round(scores.delivery_score)));
            const total = theme + creativity + aiUsage + delivery;

            return {
              submission_id: sub.id,
              theme_score: theme,
              creativity_score: creativity,
              ai_usage_score: aiUsage,
              delivery_score: delivery,
              total_score: total,
              review_comment: scores.review_comment || '심사평을 생성하지 못했습니다.',
              _originalIndex: index,
            };
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            console.error(`Failed to judge submission ${sub.id}:`, err);
            return {
              submission_id: sub.id,
              theme_score: 15,
              creativity_score: 12,
              ai_usage_score: 12,
              delivery_score: 10,
              total_score: 49,
              review_comment: `AI 심사 중 오류가 발생하여 기본 점수가 부여되었습니다. (상세 에러: ${errorMsg})`,
              _originalIndex: index,
            };
          }
        }

        // Process in parallel batches
        let completed = 0;
        for (let batchStart = 0; batchStart < submissions.length; batchStart += BATCH_SIZE) {
          const batch = submissions.slice(batchStart, batchStart + BATCH_SIZE);
          const batchPromises = batch.map((sub: Record<string, string>, i: number) =>
            judgeOne(sub, batchStart + i)
          );

          const batchResults = await Promise.allSettled(batchPromises);

          for (const settled of batchResults) {
            if (settled.status === 'fulfilled') {
              results.push(settled.value);
            }
            completed++;
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ progress: completed, total: submissions.length })}\n\n`));
        }

        // Calculate rankings
        results.sort((a, b) => b.total_score - a.total_score);
        results.forEach((r, i) => {
          (r as Record<string, unknown>).ranking = i + 1;
        });

        // Delete existing results and insert new ones in bulk
        const { error: deleteError } = await supabase.from('judge_results').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (deleteError) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `DB 삭제 실패: ${deleteError.message}` })}\n\n`));
          controller.close();
          return;
        }

        // Strip internal _originalIndex before saving
        const dbResults = results.map(({ _originalIndex, ...rest }) => rest);

        const { error: upsertError } = await supabase.from('judge_results').upsert(dbResults, { onConflict: 'submission_id' });
        if (upsertError) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: `DB 저장 실패: ${upsertError.message}` })}\n\n`));
          controller.close();
          return;
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ completed: true, progress: submissions.length, total: submissions.length })}\n\n`));
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
    console.error('Judge API error:', errorMessage);
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
