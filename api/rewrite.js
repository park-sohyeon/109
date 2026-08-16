const REWRITE_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['alternatives'],
  properties: { alternatives: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'object', additionalProperties: false, required: ['kind', 'note', 'text'], properties: { kind: { type: 'string', enum: ['SOFT', 'CLEAR', 'SHORT'] }, note: { type: 'string' }, text: { type: 'string' } } } } }
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST requests only' });
  const { message, relationship = '', purpose = '' } = req.body || {};
  if (!message || typeof message !== 'string' || message.length > 500) return res.status(400).json({ error: '메시지는 1~500자로 입력해 주세요.' });
  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'AI 분석이 아직 연결되지 않았습니다.' });
  const prompt = `당신은 한국어 메시지 전송 전 판단 도우미다. 아래 원문을 분석해, 화자의 핵심 주장·감정·요청 대상을 절대 바꾸지 않고 자연스러운 한국어 메시지 세 개로 다시 써라.

중요 규칙:
- 원문에 없던 사실, 사과, 질문, 요구, 약속을 추가하지 않는다.
- 원문 뒤에 설명 문장을 덧붙이지 않는다. 각 결과는 그 자체로 완결된 메시지여야 한다.
- 특히 종결어미와 어조를 실제로 다르게 만든다.
- SOFT: 상대를 몰아붙이지 않는 부드러운 표현.
- CLEAR: 경계와 내 입장을 명확히 하는 표현.
- SHORT: 같은 뜻을 가장 짧고 담백하게 전달한다.
- note는 말투 차이를 설명하는 16자 이내 한국어다.
- 존댓말/반말은 원문의 기본 말투를 따른다.
- 결과는 반드시 한국어로 작성한다.

예시 (형식만 참고):
원문: 너의 일정에만 내가 다 맞출 수는 없잖아! 너무한 거 아니야?
SOFT: 너의 일정에만 내가 계속 맞추는 건 조금 부담스러워. 이 부분은 한 번 생각해줄래?
CLEAR: 너의 일정에만 내가 계속 맞추는 건 너무하다고 생각해.
SHORT: 나도 내 일정이 있어서 계속 맞추기는 어려워.

상대와의 관계: ${relationship || '미입력'}
메시지 목적: ${purpose || '미입력'}
원문: ${message}`;
  try {
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: 'gpt-5-mini', input: prompt, text: { format: { type: 'json_schema', name: 'message_rewrites', strict: true, schema: REWRITE_SCHEMA } } }) });
    if (!response.ok) throw new Error(`OpenAI error: ${response.status}`);
    const data = await response.json();
    return res.status(200).json(JSON.parse(data.output_text));
  } catch (error) { return res.status(502).json({ error: 'AI 문장 분석에 실패했습니다.' }); }
};
