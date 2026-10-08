from pathlib import Path
import re

dart_files = list(Path("lib").rglob("*.dart"))
if not dart_files:
    raise SystemExit("BLOCKED - no Dart source found after RC24 extraction")

theme_file = None
for path in dart_files:
    text = path.read_text()
    if "class HyramColors" in text:
        theme_file = path
        break
if theme_file is None:
    raise SystemExit("BLOCKED - HyramColors definition not found; refusing guessed patch")

text = theme_file.read_text()
palette = {
    "bg": "0xFFF7F5EE",
    "panel": "0xFFFFFDF8",
    "gold": "0xFFA88436",
    "text": "0xFF183126",
    "muted": "0xFF66756D",
}
changed = 0
for name, value in palette.items():
    pattern = rf"(static\s+const\s+Color\s+{name}\s*=\s*(?:const\s+)?Color\()0x[0-9A-Fa-f]+(\)\s*;)"
    updated, count = re.subn(pattern, rf"\g<1>{value}\g<2>", text)
    if count:
        text = updated
        changed += count
if changed == 0:
    raise SystemExit(f"BLOCKED - {theme_file} palette shape is unknown; refusing unsafe theme rewrite")
theme_file.write_text(text)

membership_hits = 0
for path in dart_files:
    text = path.read_text()
    original = text
    text = text.replace("'SILVER · GOLD · BLACK'", "'SILVER · GOLD · PREMIUM · VIP'")
    text = text.replace('"SILVER · GOLD · BLACK"', '"SILVER · GOLD · PREMIUM · VIP"')
    text = text.replace("'멤버십 BLACK", "'멤버십 VIP")
    text = text.replace('"멤버십 BLACK', '"멤버십 VIP')
    if text != original:
        path.write_text(text)
        membership_hits += 1

tier = Path("lib/theme/hyram_membership_colors.dart")
tier.parent.mkdir(parents=True, exist_ok=True)
tier.write_text("""import 'package:flutter/material.dart';

abstract final class HyramMembershipColors {
  static const silver = Color(0xFFAAB3B8);
  static const gold = Color(0xFFC9A44C);
  static const premiumDiamond = Color(0xFFB8E3EA);
  static const premiumDiamondAccent = Color(0xFFC9CCF4);
  static const vipBlack = Color(0xFF111311);
}
""")
print(f"PASS - light premium palette applied in {theme_file}")
print(f"Membership literal files updated - {membership_hits}")
print("PASS - four-tier membership color contract created")
