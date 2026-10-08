from pathlib import Path

path = Path("lib/theme/hyram_membership_colors.dart")
if not path.is_file():
    raise SystemExit("FAIL - membership color contract missing")
text = path.read_text()
required = {
    "silver": "0xFFAAB3B8",
    "gold": "0xFFC9A44C",
    "premiumDiamond": "0xFFB8E3EA",
    "vipBlack": "0xFF111311",
}
missing = [name for name, value in required.items() if value not in text]
if missing:
    raise SystemExit("FAIL - missing tier colors: " + ", ".join(missing))
print("PASS - HYRAM app visual contract verified")
