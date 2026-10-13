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
# RC24 uses inferred Color types and legacy semantic names. Keep the public
# names used throughout the app, but change every surface/text pair together.
palette = {
    "black": "0xFFF7F5EE",
    "panel": "0xFFFFFDF8",
    "panel2": "0xFFECE9DF",
    "gold": "0xFFA88436",
    "champagne": "0xFF806323",
    "ivory": "0xFF183126",
    "muted": "0xFF66756D",
}
for name, value in palette.items():
    pattern = rf"(static\s+const\s+(?:Color\s+)?{name}\s*=\s*(?:const\s+)?Color\()0x[0-9A-Fa-f]+(\)\s*;)"
    text, count = re.subn(pattern, rf"\g<1>{value}\g<2>", text)
    if count != 1:
        raise SystemExit(f"BLOCKED - expected one {name} declaration in {theme_file}, found {count}")
# A light surface with ThemeData.dark would leave inherited text unreadable.
for factory in ("ThemeData", "ColorScheme"):
    pattern = rf"\b{factory}\.(?:dark|light)\("
    text, count = re.subn(pattern, f"{factory}.light(", text)
    if count != 1:
        raise SystemExit(f"BLOCKED - expected one {factory} constructor, found {count}")
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
