# HYRAM GOLF — 배너와 회원 화면 출시 전 검증 (2026-10-16)

## 범위
- 메인 / 클럽 컬렉션에 3개 차별화 배너: PERFORMANCE, CUSTOM LAB, TRADE & CARE.
- 메인, 클럽, MY FITTING, 주문·결제 화면에 로그인·회원가입 진입 링크.
- `web/login.html`, `web/signup.html` 독립 화면과 공통 `web/account.css`.
- `web/campaign.css`는 외부 제조사 이미지, 검증되지 않은 할인·공식 제휴·성과 보증을 사용하지 않음.
- `qa/test_campaign_auth_web.py` 정적 경로 및 민감정보 차단 검사 추가.

## 지금 제공되는 기능
- 배너 클릭 → MY FITTING 내 PERFORMANCE / CUSTOM / CARE 체험 섹션 이동.
- 로그인·회원가입 페이지 디자인 확인 및 비회원 서비스 접근.
- 이메일, 비밀번호는 disabled fieldset이며 **접수·인증·저장되지 않음**.
- 현재 MY FITTING 기록은 브라우저 localStorage에만 존재. 계정 동기화 없음.

## 출시 게이트 (미완료)
- [ ] 모바일 실제 브라우저 375/390px에서 메뉴 겹침, 클릭 영역, 가로 스크롤 및 링크 확인 + 스크린샷
- [ ] account UI 접근성(키보드·스크린리더), 법적 고지 및 개인정보처리방침
- [ ] 서버 인증: 가입 동의, 비밀번호 해시, 가입 확인, 로그인 시도 제한/계정 잠금, 세션·CSRF·토큰 관리, 비밀번호 재설정, 로그아웃, 관리자 권한
- [ ] 회원 데이터 동기화, 암호화, 접근제어, 백업·삭제·내보내기 및 동의/보유기간
- [ ] HTTPS 및 정식 공개 URL에서 `/`, `/shop.html`, `/login.html`, `/signup.html`, `/fitting.html` 확인
- [ ] 부모 PR #6·#4 필수 QA 및 Pages 배포 PASS; Android 별도 QA
- [ ] 실결제·실제 예약·상품 재고·회원 기능은 연동 전까지 활성화하지 않음

**Static PASS ≠ live browser PASS ≠ published.**
이 변경은 feature branch에만 있으며 main 병합 및 운영 사이트/앱 배포를 뜻하지 않는다.
