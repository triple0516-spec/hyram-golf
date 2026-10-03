# RC24 UI test remediation — 2026-10-04 KST

Base commit: c0ab10beadcb0eb1bafe1bf506efc01cad4c6801.
Original archive Git blob verified: 635ac583b9622094202d169f4749c6c5841288ea.

The source is currently stored as a ZIP. This patch is applied explicitly by qa/validate_rc24.sh; the original ZIP and main workflow are not changed by this draft.

## Fixed
- LuxuryCard now places a transparent Material above its colored decoration, with InkWell inside Material. This fixes Flutter exceptions on login and signup and preserves the card border/shadow.
- The internal checkout test scrolls the lazy ListView before checking the QA dropdown. The test assertion is retained.

## Executed locally
- Flutter 3.47.5 / Dart 3.13.4 / ADB 34.0.4 / Java and javac 17.0.20: exit 0.
- Android host generation and foreground location configuration: exit 0.
- flutter pub get: exit 0.
- flutter analyze: No issues found, exit 0.
- flutter test test --dart-define=HYRAM_ENV=internal: 13 passed, exit 0.
- flutter test test: 13 passed, exit 0.
- flutter test integration_test/app_flow_test.dart --dart-define=HYRAM_ENV=internal: exit 1, no supported devices connected. BLOCKED, not PASS.
- APK/native UI/Galaxy QA: NOT TESTED after the blocked integration gate. No release or commercial-readiness claim.

Latest existing CI run 36248865560 had 10 passing / 3 failing internal tests, before these changes. No successful CI rerun or APK is claimed.
Production account, identity verification, booking and payment provider integrations remain disabled until real service integration is supplied and verified.

## Continue
Run bash qa/validate_rc24.sh with an authorized Android test device and full Android SDK. It stops at the first failing gate and will not build an APK before integration tests pass.
