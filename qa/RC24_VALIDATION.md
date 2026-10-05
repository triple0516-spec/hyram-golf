# RC24 UI fixes and Android QA validation — 2026-10-05 KST

## Scope and source
Base: c0ab10beadcb0eb1bafe1bf506efc01cad4c6801.
Original ZIP blob: 635ac583b9622094202d169f4749c6c5841288ea (unchanged).
The workflow and qa/validate_rc24.sh both extract the ZIP and apply qa/rc24-ui-fixes.patch.
The patch changes LuxuryCard Material/InkWell ancestry, checkout widget-test scrolling,
and integration-flow keyboard dismissal, booking-button targeting, scrolling and exception checks.
This PR also changes the Android workflow. It is not a production release.

## Confirmed CI evidence, tied to an exact revision
Head 370c2fd91f4042e56fd6fd7898404aaede830e0e:
https://github.com/triple0516-spec/hyram-golf/actions/runs/37264643175
Job 111618751791 completed successfully on 2026-10-05.
- ZIP extraction/patch application and Android configuration succeeded.
- Android integration gate: "1 test passed."
- Application debug APK build, nonempty-file check, SHA-256 generation and upload succeeded.
- Artifacts: hyram-golf-qa-apk (11326526532), hyram-build-evidence (11326586376).
- Artifact ZIP SHA-256 is NOT the contained APK SHA-256. Use app-debug.apk.sha256 for device QA.
This evidence applies to that revision only. Any subsequent executable changes require
a successful run on the new PR head; record its link in the PR body.

Previous head 0076a3f21d2ed25f10fde4ff89a255acf3945c41:
https://github.com/triple0516-spec/hyram-golf/actions/runs/37261703271
Integration failed after shell startup warnings, QEMU hangs and a runner shutdown signal.
APK build/upload was skipped. The log does not prove an out-of-memory root cause.
The following revision limits Gradle resources, compiles the integration APK before
starting the CI emulator, isolates shell startup and records runner resources.

Historical local results on 2026-10-04 are not current device evidence:
analyze and internal/production widget suites passed; integration was BLOCKED because
no supported device was attached, so that local APK gate was not executed.

## Local replay
Use Flutter 3.47.5, Dart bundled with it, JDK 17 and a full Android SDK.
Connect and authorize an Android device or boot an emulator, then run:

```bash
adb devices -l
env -u BASH_ENV bash --noprofile --norc qa/validate_rc24.sh <adb-device-serial>
```

The script applies the CI minSdk 26 and Gradle resource limits, runs the gates in order,
selects only the supplied serial and requires sys.boot_completed=1 before integration.
It retains a temporary workspace printed at startup with evidence/replay.log,
exit-code.txt, device.txt, android-integration.log, apk-build.log and resolved build settings.
The final APK and its checksum remain in hyram_rc9/build/app/outputs/flutter-apk/.
The script stops on failure; the APK gate cannot execute after failed integration.
CI provisions an API 35 x86_64 Pixel 2 emulator and precompiles the integration test
before emulator startup; local replay deliberately uses an already-authorized device.
A local replay is separate evidence and must not be inferred from the CI run.
CI checks script syntax; that check alone is not a full replay PASS.

## Review conditions
On 2026-10-05, GitHub Settings showed no classic branch protection and no rulesets.
No server-enforced required-check or approval rule was configured. Settings were not changed.
Keep draft until the new executable revision's CI completes successfully.
Ready for review concerns UI fixes and the Android QA build path, not release approval.
Merge remains a separate decision.

## Native UI and Galaxy QA — NOT TESTED
The editing environment has no available ADB executable; physical Galaxy execution
cannot be claimed from that environment. Emulator integration is not Galaxy QA.
Use the application APK artifact from a successful run, not the integration-test APK.
Before installation, independently calculate the APK SHA-256 and compare it with the
included checksum (the checksum file may name its original runner-relative path).

Record only observed values:
- Run URL / head SHA:
- APK SHA-256:
- Galaxy model / Android version / build:
- Tester / timestamp / installation method:
- Evidence file(s), expected and observed outcome, status, defect reference:

| Check | Required observation | Current status |
| --- | --- | --- |
| Install and cold launch | Successful install, no crash, login screen visible | NOT TESTED |
| Login and signup screens | Material rendering and card clipping correct; no framework errors | NOT TESTED |
| Keyboard and scrolling | Fields/buttons remain reachable with keyboard open and dismissed | NOT TESTED |
| Location permission allow | Trigger the actual location feature; observe system prompt and allowed behavior | NOT TESTED |
| Location permission deny | Denial handled without crash; retry/settings guidance works where applicable | NOT TESTED |
| Back navigation | Keyboard dismissal and screen navigation behave correctly | NOT TESTED |
| System bars | No content hidden beneath status/navigation bars; check device navigation mode | NOT TESTED |

If one check fails, record FAIL, stop dependent gates, fix and repeat the same condition
before regression checks. BLOCKED and NOT TESTED are never PASS.
No device model, OS, checksum, screenshot or result has been invented.
Production account, identity verification, booking and payment integrations remain
disabled pending real service integration and verification. Play release is not approved.
