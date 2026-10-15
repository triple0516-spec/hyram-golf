# HYRAM GOLF — Google Play 출시 준비 점검 (2026-10-15)

> 상태: **PREPARATION ONLY**. 이 문서는 출시 승인이 아니며, 작업 완료 증거가 없는 항목은 반드시 NOT TESTED/BLOCKED로 유지한다.

## 현재 근거

- PR #4 (draft, 미병합): https://github.com/triple0516-spec/hyram-golf/pull/4
- 2026-10-13 PR head `7ea066217e6c3e718c61d8b7e7709163ee921b2e`: QA APK·Android integration 성공: https://github.com/triple0516-spec/hyram-golf/actions/runs/38401574174
- 위 결과는 **debug APK**의 CI 통과일 뿐, release AAB·삼성 실기기·실결제 검증을 뜻하지 않는다.
- 2026-10-13 main 빌드 실패(작업 0개): https://github.com/triple0516-spec/hyram-golf/actions/runs/38403038131
- 앱/웹 서비스 계약: `docs/APP_WEB_SERVICE_CONTRACT_2026-10-09.md`.

## 출시 차단 게이트

| Gate | Required proof | Status |
| --- | --- | --- |
| CI YAML 복구 | 검증 중인 branch에서 정상 job 시작 및 완주 | NEEDS VERIFICATION |
| Mobile PR QA | 375px/390px 화면·상담·클립보드·팝업·Pages 공개 검증 | NOT TESTED |
| 기존 PR #4 병합 | 위 수동 QA + Pages 검증 후 사용자 승인 | BLOCKED |
| Android package ID/이름/아이콘 | release APK/AAB 내부 및 화면에서 확인 | NOT TESTED |
| Android target API | 새 앱 제출용 `targetSdk >= 36` 확인 | NOT TESTED |
| Release signing | 비공개 업로드 키로 서명한 release AAB; 키·암호 저장소에 커밋 금지 | BLOCKED |
| Release AAB | `flutter build appbundle --release`, AAB SHA-256 및 비공개 서명 검증 | NOT TESTED |
| Real Galaxy QA | 냉시작·로그인·권한 허용/거부·상담·뒤로가기·접근성·웹 이동; 기종/OS/사진/해시 | NOT TESTED |
| 실제 서비스 기능 | 로그인·회원가입·결제·예약·취소·환불/약관·백엔드 연결 실측 | BLOCKED |
| 스토어 정책 | 앱 콘텐츠, 개인정보처리방침 공개 URL, 데이터 보안·계정 삭제 경로, 권한 정합성 | BLOCKED |
| Play Console | 개발자 등록·신원확인, 앱 생성, 테스트 트랙 접근, 검토·승인 | NOT TESTED |

**서비스 규칙:** 백엔드가 연결되지 않은 문의는 '접수 완료'로 표시하지 않는다. 결제·예약·재고를 실제로 확정하지 못하는 경우 화면과 Play 설명에서 해당 기능을 확약하지 않는다. 구매/레슨/부킹 등은 현재 상담 기능으로 한정해 정확하게 설명한다.

## Google Play 앱 등록 자료 초안 (확정 전 검수)

- 앱 이름: `HYRAM GOLF`
- 앱 종류: 앱 (게임 아님)
- 앱 언어: 한국어(ko-KR)
- 카테고리: 쇼핑 또는 스포츠 중 앱의 실제 주요 기능에 맞춰 결정
- 짧은 설명 *초안*: `골프 클럽·중고클럽 상담, 피팅·레슨 및 골프장 부킹 문의를 한곳에서.`
- 자세한 설명은 실제로 구현·검증된 기능만 작성. 실제 결제/예약/회원권 자동 결제를 광고하지 말 것.
- 필요 자료: 고해상도 앱 아이콘(512x512), 그래픽 이미지(1024x500), 앱 스크린샷(실제 앱 화면), 개인정보처리방침의 공개 HTTPS URL, 개발자 연락처, 데이터 안전/권한/계정 삭제 설문 응답, 콘텐츠 등급, 광고 여부, 대상 연령.
- 고객 상담 오픈채팅 URL은 게시 전 실제 작동과 운영 주체 확인 후 노출한다.

## 실행 순서

1. PR 본문에 Android 성공 run·APK SHA·Galaxy 기종 및 실측 결과 기록. 기존 PR #4는 수동 QA 전 병합 금지.
2. 이 PR의 Android workflow 복구를 검증한 뒤 main 병합 여부 결정. 성공 실행 결과가 없으면 '수정 완료'로 선언하지 않기.
3. `flutter create` 뒤 실제 Android 프로젝트의 `applicationId`, `targetSdk`, 권한, 플러그인을 검사한다. 제출 시점 Android API 36 이상.
4. 계정 소유자가 비공개 업로드 서명키 생성·보관. CI에서 필요한 경우 GitHub Actions **secrets**로 전달하고 로그에 노출하지 않는다.
5. 승인된 버전에서 서명된 `.aab`를 별도 산출한다. debug APK를 Play Console에 업로드하지 않는다.
6. Galaxy 기기에서 실사용 QA, 개인정보처리/데이터 안전 설문 사실확인 후 내부 테스트에 제출한다.
7. **2023-11-13 이후 생성된 개인 Play 개발자 계정**은 일반적으로 12명 이상이 연속 14일 참여한 비공개 테스트와 프로덕션 액세스 신청이 필요하다. 계정 유형·생성 시점은 Console에서 확인한다.
8. 리뷰 승인 및 배포 범위를 사용자가 직접 확인 후 프로덕션 배포한다.

## 공식 참고

- 대상 API 정책: https://support.google.com/googleplay/android-developer/answer/11926878?hl=ko
- 개인 개발자 테스트 요건: https://support.google.com/googleplay/android-developer/answer/14151465?hl=ko
- 앱 서명: https://developer.android.com/studio/publish/app-signing?hl=ko
- Google Play Console: https://play.google.com/console/
