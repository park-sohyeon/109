# 보내도 돼?

메시지의 핵심 의미는 유지하고, 부드럽게·분명하게·짧게 세 가지 어조로 다시 쓰는 전송 전 판단 도구입니다.

## 실행

정적 화면만 확인하려면 `index.html`을 브라우저에서 열거나 `py -3 -m http.server 8000`을 실행합니다. 이 경우 AI 문장 분석 API는 없으므로 기본 시연 문장만 동작합니다.

의미를 분석한 실제 문장 재작성은 Vercel에 배포해 사용합니다. Google AI Studio의 Gemini API 무료 티어를 사용하므로 OpenAI 결제 계정은 필요하지 않습니다. 무료 티어에는 요청 횟수 제한이 있습니다.

1. Vercel에서 이 폴더를 새 프로젝트로 배포합니다.
2. [Google AI Studio](https://aistudio.google.com/app/apikey)에서 무료 Gemini API 키를 만든 뒤, Project Settings → Environment Variables에 `GEMINI_API_KEY`를 설정합니다. `.env.example`의 값은 예시이며 실제 키를 저장하지 않습니다.
3. 재배포한 뒤 메시지를 입력합니다. 브라우저는 `/api/rewrite`만 호출하고 API 키는 서버에만 남습니다.

원문은 이 서비스의 로그나 데이터베이스에 저장하지 않도록 구현했습니다. 단, Gemini 무료 티어는 제공업체의 데이터 처리 정책이 적용되므로, 민감한 개인정보는 입력하지 않도록 화면과 개인정보 안내에 명시하세요.
