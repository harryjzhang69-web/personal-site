import { buildInterviewReport, jsonResponse, corsHeaders } from '../_shared.js';

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

// POST /api/report
// 入参：{ role, type, history: [{q, a}, ...] }
// 出参：{ code:0, data:{ overall_score, level, dimensions[], highlights[], weaknesses[], suggestions[], model_answer } }
export async function onRequestPost(context) {
  const { request, env } = context;
  const data = await request.json().catch(() => ({}));
  const role = (data.role || 'pm').trim();
  const type = (data.type || 'product-design').trim();
  const history = Array.isArray(data.history) ? data.history : [];

  if (!history.length) {
    return jsonResponse({ code: -1, message: '还没有面试记录，无法生成报告' });
  }

  try {
    const report = await buildInterviewReport(env, { role, type, history });
    return jsonResponse({ code: 0, data: report });
  } catch (reason) {
    return jsonResponse({
      code: reason && reason.code === 'BUSY' ? 1 : -1,
      message: (reason && reason.message) || '报告生成失败，请重试'
    });
  }
}
