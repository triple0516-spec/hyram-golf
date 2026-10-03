#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
for executable in flutter dart adb java javac python3 unzip patch; do
  command -v "$executable" >/dev/null || { echo "BLOCKED: $executable missing" >&2; exit 2; }
done
flutter --version
dart --version
adb version
java -version
javac -version
work="$(mktemp -d)"
echo "Validation workspace: $work"
unzip -q "$root/HYRAM_GOLF_RC24_SOURCE.zip" -d "$work"
cd "$work/hyram_rc9"
patch --batch --forward -p1 < "$root/qa/rc24-ui-fixes.patch"
flutter create . --platforms=android --org com.hyram --project-name hyram_golf
python3 tool/configure_mobile_hosts.py android
flutter pub get
flutter analyze
flutter test test --dart-define=HYRAM_ENV=internal
flutter test test
if ! adb devices | awk 'NR>1 && $2 == "device" {found=1} END {exit !found}'; then
  echo "BLOCKED: no authorized Android device; integration and APK gates not run." >&2
  exit 2
fi
flutter test integration_test/app_flow_test.dart --dart-define=HYRAM_ENV=internal
flutter build apk --debug --dart-define=HYRAM_ENV=internal
test -s build/app/outputs/flutter-apk/app-debug.apk
sha256sum build/app/outputs/flutter-apk/app-debug.apk
echo "APK built. Native UI and physical Galaxy QA still require separate evidence."
