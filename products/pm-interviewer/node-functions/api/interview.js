import { nextInterviewTurn, jsonResponse, corsHeaders } from '../_shared.js';

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

// POST /api/interview
// 入参：{ role, type, history: [{q, a}, ...] }
// 出参：{ code:0, data:{ action, comment, question, is_followup, round } }
export async function onRequestPost(context) {
  const { request, env } = context;
  const data = await request.json().catch(() => ({}));
  const role = (data.role || 'pm').trim();
  const type = (data.type || 'product-design').trim();
  const history = Array.isArray(data.history) ? data.history : [];

  try {
    const turn = await nextInterviewTurn(env, { role, type, history });
    return jsonResponse({ code: 0, data: turn });
  } catch (reason) {
    return jsonResponse({
      code: reason && reason.code === 'BUSY' ? 1 : -1,
      message: (reason && reason.message) || '面试官暂时没反应，请重试'
    });
  }
}
