# 기술 검수 및 제작 결과 보고서

기준 문서: `casual_web_games_design_plan_final_v1.2.md` (2026-10-19)

## 1. 구현 범위
- Vite + TypeScript 다중 페이지 정적 사이트
- Toolmingle Play 허브, Zapdash, Prismerge, About, Privacy, Contact
- CSS/텍스트 기호 기반 UI, 모바일 반응형 및 `prefers-reduced-motion`
- 브라우저 로컬 저장과 저장 데이터 검증
- Cloudflare Workers Static Assets용 `wrangler.jsonc`, SEO 생성 스크립트, beta/production 환경 예시
- Vitest 기반 엔진 테스트

## 2. 게임 규칙 검수
### Zapdash
- 30초 세션, 800–2500ms 무작위 대기, 1500ms 신호 제한
- `performance.now()` 기반 반응 시간 측정
- 조기 입력, 놓침, 연속 성공 점수 및 평균/중앙값/최고 기록/표준편차/정확도 표시
- 탭이 숨겨지면 일시정지

정확도는 기획서에서 분모가 명시되지 않아 구현상 `성공 / (성공 + 조기 입력 + 놓침)`으로 정의했습니다. 반복된 조기 입력은 각각 시도 횟수로 계산되므로 플레이 테스트 후 확정이 필요합니다.

### Prismerge
- 7×7 보드, 3장 손패, 1–3등급 타일 백(6/3/1)
- 시드 기반 의사난수 생성
- 상하좌우 연결 탐색, 같은 등급 3개 이상 합성, 방금 놓은 칸에서 연쇄 합성
- 연쇄 점수 배율 최대 3×, 최고 등급 제거 보너스
- 보드가 합성 후 가득 차면 종료
- 진행 중 게임 및 최고 기록 로컬 저장

## 3. 제한 및 출시 전 작업
1. Prismerge/Zapdash는 임시 이름이며 상표/도메인 확인이 필요합니다.
2. 기록 내보내기/가져오기 및 기기간 동기화는 미구현입니다.
3. Prismerge 충전/프라임 파동 규칙은 미구현입니다.
4. 개인정보/문의 페이지는 초안입니다. 운영자 연락처와 법적 검토가 필요합니다.
5. AdSense는 비활성화 상태입니다.
6. 실제 iOS/Android 기기 및 Cloudflare 배포 응답 헤더는 아직 검증하지 않았습니다.
7. 실제 npm 설치, Vitest 및 Vite 빌드는 이 환경의 npm registry DNS 오류(`EAI_AGAIN`)로 실행하지 못했습니다. 로컬에서 `npm install`, `npm test`, `npm run build`를 실행해야 합니다.

## 4. Cloudflare 연결 전 체크리스트
- [ ] 로컬에서 의존성 설치 성공
- [ ] `npm test` 성공
- [ ] `npm run build` 성공
- [ ] 베타 빌드의 `noindex` 및 `X-Robots-Tag` 확인
- [ ] 개인정보/문의 페이지를 실제 운영 정보로 보완
- [ ] Cloudflare 계정, 배포 이름, 사용자 지정 도메인 확인
- [ ] 도메인 DNS/HTTPS 확인
