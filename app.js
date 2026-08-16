const $ = (s) => document.querySelector(s);
const modes = {
  ex: { label: '전 연인', banner: '지금 감정이 큰 상태라면, 더 좋은 문장보다 <b>잠시 보내지 않는 선택</b>이 도움이 될 수 있어요.', risks: [['지금 / 당장', '감정이 높은 순간의 즉시 전송은 내일 다르게 느껴질 수 있어요.'], ['왜', '상대에게 해명을 요구하는 말은 대화를 더 어렵게 만들 수 있어요.']], alts: ['갑자기 연락해서 미안해. 지금은 감정이 올라와 있어서, 내일 차분해진 뒤 다시 생각해볼게.', '나는 아직 이 일에 마음이 남아 있어. 하지만 지금 바로 답을 바라며 연락하고 싶지는 않아.', '지금은 보내지 않을게. 내일 다시 생각해볼게.'] },
  senior: { label: '교수님 · 선배', banner: '상대가 바로 답할 수 있도록 <b>신원 · 용건 · 필요한 시점</b>을 분명히 해보세요.', risks: [['애매한 부탁', '무엇을 원하는지 명확하지 않으면 상대도 답하기 어려워요.'], ['긴 설명', '핵심 요청을 앞에 두면 읽는 부담을 줄일 수 있어요.']], alts: ['안녕하세요, 교수님. ○○수업 수강 중인 ○○○입니다. 과제 주제 관련해 한 가지 여쭙고 싶은데, 가능하실 때 답변 부탁드립니다.', '안녕하세요. ○○ 관련해서 조언을 구하고 싶어 연락드렸습니다. 이번 주 안에 10분 정도 이야기 나눌 수 있을까요?', '안녕하세요, ○○○입니다. ○○에 대해 이번 주까지 확인 가능하실까요?'] },
  decline: { label: '거절', banner: '미안함 때문에 여지를 남기기보다, <b>감사 · 거절 · 짧은 이유 · 마무리</b>를 차분히 전해보세요.', risks: [['아마 / 나중에', '확신 없는 여지는 서로의 기대를 길게 만들 수 있어요.'], ['미안해', '사과가 길어지면 거절의 뜻이 흐려질 수 있어요.']], alts: ['마음 전해줘서 고마워. 생각해봤지만 나는 그 관계로 이어가기는 어려울 것 같아. 좋은 마음으로 이해해주면 좋겠어.', '고마워. 하지만 나는 같은 마음으로 만나기는 어렵다는 생각이 분명해. 서로에게 더 편한 선택이었으면 해.', '고마워. 나는 만나기 어려울 것 같아. 이해해줘.'] },
  hard: { label: '어려운 대답', banner: '정답보다 중요한 건 <b>내 말투를 지키면서 상대의 답장 부담을 줄이는 것</b>이에요.', risks: [['왜?', '짧은 질문도 추궁처럼 느껴질 수 있어요.'], ['꼭', '상대가 선택할 여지를 잃을 수 있어요.']], alts: ['내가 조금 서운했던 건 사실이야. 네 입장도 듣고 싶고, 괜찮을 때 편하게 이야기해도 돼.', '나는 이 부분이 반복되면 힘들 것 같아. 앞으로는 이런 방식은 어려울 것 같다는 내 마음을 알아줬으면 해.', '나는 이게 조금 힘들었어. 괜찮을 때 얘기해줄래?'] }
};
const general = { banner: '관계와 목적, 원문을 함께 보고 <b>뜻은 유지한 채 말투만</b> 다듬었어요.', risks: [['강한 표현', '지금의 감정이 의도보다 크게 전달될 수 있어요.'], ['답장 요구', '상대가 바로 반응해야 한다는 부담을 느낄 수 있어요.']] };
let selected = '';
let alternatives = [];
const store = JSON.parse(localStorage.getItem('sendOkayMetrics') || '{"checks":0,"copies":0,"holds":0,"sends":0,"feedback":0,"positive":0,"exChecks":0,"exHolds":0}');
function save(){ localStorage.setItem('sendOkayMetrics', JSON.stringify(store)); }
function toast(text){ const t=$('#toast');t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2800); }
function pct(a,b){ return b ? Math.round(a/b*100)+'%' : '—'; }
function renderMetrics(){ const outcomes=store.feedback; $('#coreRate').textContent=pct(store.copies+store.holds,store.checks); $('#copyRate').textContent=pct(store.copies,store.checks); $('#holdRate').textContent=pct(store.holds,store.checks); $('#outcomeRate').textContent=pct(store.positive,outcomes); }
function tidy(text){ return text.replace(/\s+/g,' ').replace(/\s*([,.!?])\s*/g,'$1 ').trim(); }
function soften(text){
  const swaps=[[/진짜|너무/g,'많이'],[/왜/g,'어떤 이유로'],[/당장/g,'가능하면'],[/빨리/g,'괜찮을 때'],[/무조건/g,'되도록'],[/짜증나/g,'힘들었어'],[/싫어/g,'어려울 것 같아']];
  let result=tidy(text); swaps.forEach(([from,to])=>result=result.replace(from,to));
  return result;
}
function clarify(text){
  const result=tidy(text).replace(/\b(혹시|그냥|좀|약간|아마|괜히)\s*/g,'').replace(/\.\s*\./g,'.');
  return result;
}
function shorten(text){
  return tidy(text).replace(/\b(진짜|너무|되게|완전|사실|약간)\s*/g,'').replace(/(ㅠㅠ|ㅜㅜ|\.\.\.)/g,'').replace(/\s+/g,' ').trim();
}
function makeAlternatives(text){
  const original=tidy(text);
  return [
    {kind:'SOFT', note:'강한 표현을 부드럽게', text:soften(original)},
    {kind:'CLEAR', note:'내 뜻을 또렷하게', text:clarify(original)},
    {kind:'SHORT', note:'핵심만 짧게', text:shorten(original)}
  ];
}
async function analyse(){ const text=$('#message').value.trim(); if(!text){ $('#message').focus();toast('먼저 보내려던 문장을 적어주세요.');return; } const button=$('#analyze'); button.disabled=true; button.textContent='문장 다듬는 중…'; const m=general; const found=[]; const keywordMap=[['미친','감정이 강한 표현은 의도보다 크게 전달될 수 있어요.'],['답장','답을 재촉하는 느낌이 들 수 있어요.'],['왜','상대가 방어적으로 느낄 수 있어요.'],['당장','급한 요구은 대화의 여유를 줄여요.'],['죽','강한 표현은 잠시 멈춰 확인하는 편이 좋아요.']]; keywordMap.forEach(([word,reason])=>{if(text.includes(word))found.push([`“${word}”`,reason]);}); try { const response=await fetch('/api/rewrite',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,relationship:$('#relationship').value.trim(),purpose:$('#purpose').value.trim()})}); if(!response.ok) throw new Error(); const data=await response.json(); alternatives=data.alternatives; } catch { alternatives=makeAlternatives(text); toast('AI 연결 전에는 기본 점검 문장을 보여드려요.'); } finally { button.disabled=false; button.innerHTML='메시지 점검하기 <span>→</span>'; } $('#riskList').innerHTML=(found.length?found:m.risks).map(([word,reason])=>`<div class="risk-item"><span class="risk-word">${word}</span><p>${reason}</p></div>`).join(''); $('#choiceBanner').innerHTML=m.banner; $('#altGrid').innerHTML=alternatives.map((alt,i)=>`<article class="alternative" data-alt="${i}"><span class="alt-kind">${alt.kind}</span><small class="alt-note">${alt.note}</small><p>${alt.text}</p><button class="copy" data-copy="${i}">이 문장 복사</button></article>`).join(''); $('#riskPill').textContent=found.length ? `주의 표현 ${found.length}개` : '원문 기반 점검'; $('#results').classList.remove('hidden'); document.body.classList.add('app-result'); store.checks++; save(); window.scrollTo(0,0); }
$('#message').addEventListener('input',e=>$('#charCount').textContent=`${e.target.value.length} / 500`);
$('#analyze').addEventListener('click',analyse);
$('#editAgain').addEventListener('click',()=>{document.body.classList.remove('app-result');$('#results').classList.add('hidden');window.scrollTo(0,0);$('#message').focus();});
$('#altGrid').addEventListener('click',async e=>{const b=e.target.closest('[data-copy]');if(!b)return; const i=+b.dataset.copy;selected=alternatives[i].text;try{await navigator.clipboard.writeText(selected); }catch{} document.querySelectorAll('.alternative').forEach(x=>x.classList.toggle('selected',x.dataset.alt===String(i)));store.copies++;save();toast('원문의 뜻을 유지한 수정문을 복사했어요.');});
$('#hold').addEventListener('click',()=>{store.holds++;save();toast('10분 보류했어요. 이 선택도 충분히 잘한 거예요.');setTimeout(()=>$('#feedback').showModal(),900);});
$('#send').addEventListener('click',()=>{store.sends++;save();toast('보내기 전 점검을 마쳤어요.');setTimeout(()=>$('#feedback').showModal(),900);});
$('#metricsOpen').addEventListener('click',()=>{renderMetrics();$('#metrics').showModal();});
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$('#'+b.dataset.close).close()));
document.querySelectorAll('[data-feedback]').forEach(b=>b.addEventListener('click',()=>{store.feedback++;if(b.dataset.feedback==='yes')store.positive++;save();$('#feedback').close();toast('고마워요. 다음 선택을 더 잘 돕는 데 반영할게요.');}));
