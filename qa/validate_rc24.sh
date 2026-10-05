#!/usr/bin/env bash
set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
serial="${1:-${ANDROID_SERIAL:-}}"
if [[ -z "$serial" || $# -gt 1 ]]; then
  echo "Usage: bash qa/validate_rc24.sh <adb-device-serial>" >&2
  exit 2
fi
work="$(mktemp -d)"
mkdir -p "$work/evidence"
echo "Validation workspace and evidence: $work"
exec > >(tee "$work/evidence/replay.log") 2>&1
trap 'rc=$?; printf "Replay exit: %s\n" "$rc" > "$work/evidence/exit-code.txt"' EXIT
for executable in flutter dart adb java javac python3 unzip patch sha256sum; do
  command -v "$executable" >/dev/null || { echo "BLOCKED: $executable missing" >&2; exit 2; }
done
flutter --version
dart --version
adb version
java -version
javac -version
flutter doctor -v
unzip -q "$root/HYRAM_GOLF_RC24_SOURCE.zip" -d "$work"
cd "$work/hyram_rc9"
patch --batch --forward -p1 < "$root/qa/rc24-ui-fixes.patch"
flutter create . --platforms=android --org com.hyram --project-name hyram_golf
python3 tool/configure_mobile_hosts.py android
# Match the Android settings used by the CI workflow.
python3 - <<'PY'
from pathlib import Path
import re
path = Path("android/app/build.gradle.kts")
source = path.read_text()
updated, count = re.subn(
    r"(?m)^(\s*)minSdk\s*=\s*[^\n]+$",
    r"\1minSdk = 26",
    source,
)
if count != 1:
    raise SystemExit(f"Expected one minSdk assignment, found {count}")
path.write_text(updated)
print("Configured minSdk = 26")
PY
python3 - <<'PY'
from pathlib import Path
p = Path("android/gradle.properties")
limits = {
    "org.gradle.jvmargs": "-Xmx2G -XX:MaxMetaspaceSize=512m -XX:ReservedCodeCacheSize=256m -XX:+HeapDumpOnOutOfMemoryError",
    "org.gradle.workers.max": "2",
    "org.gradle.parallel": "false",
    "kotlin.daemon.jvmargs": "-Xmx512m",
}
lines = p.read_text().splitlines()
lines = [line for line in lines if line.split("=", 1)[0].strip() not in limits]
p.write_text("\n".join(lines + [f"{k}={v}" for k, v in limits.items()]) + "\n")
PY
flutter pub get
flutter analyze
flutter test test --dart-define=HYRAM_ENV=internal
flutter test test
# The selected device must already be booted and authorized; never pick another.
test "$(adb -s "$serial" get-state)" = "device"
test "$(adb -s "$serial" shell getprop sys.boot_completed | tr -d '\r')" = "1"
{
  echo "Serial: $serial"
  adb -s "$serial" shell getprop ro.product.manufacturer
  adb -s "$serial" shell getprop ro.product.model
  adb -s "$serial" shell getprop ro.build.version.release
  adb -s "$serial" shell getprop ro.build.version.sdk
  adb -s "$serial" shell getprop ro.build.fingerprint
} > "$work/evidence/device.txt"
flutter test integration_test/app_flow_test.dart -d "$serial" --dart-define=HYRAM_ENV=internal 2>&1 | tee "$work/evidence/android-integration.log"
flutter build apk --debug --dart-define=HYRAM_ENV=internal 2>&1 | tee "$work/evidence/apk-build.log"
test -s build/app/outputs/flutter-apk/app-debug.apk
sha256sum build/app/outputs/flutter-apk/app-debug.apk > build/app/outputs/flutter-apk/app-debug.apk.sha256
cat build/app/outputs/flutter-apk/app-debug.apk.sha256
cp pubspec.lock android/app/build.gradle.kts android/gradle.properties "$work/evidence/"
echo "APK built. Native UI and physical Galaxy QA remain NOT TESTED until recorded separately."
