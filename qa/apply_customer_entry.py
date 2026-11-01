#!/usr/bin/env python3
"""Apply the reviewed entry UI to a confirmed static-site checkout, never deploy.

Usage: python qa/apply_customer_entry.py /absolute/path/to/site-root
This supports the public expert-header page and the repository hero-copy page.
It preserves existing markup and creates index.html.before-customer-entry once.
"""
from pathlib import Path
import argparse
import shutil


def apply(site: Path) -> None:
    page = site / 'index.html'
    html = page.read_text(encoding='utf-8')
    if '<main' not in html or not ('expert-header' in html or 'hero-copy' in html):
        raise SystemExit('BLOCKED: unrecognized home page. Confirm source before applying.')
    if '</head>' not in html:
        raise SystemExit('BLOCKED: closing head missing.')
    assets = Path(__file__).resolve().parents[1] / 'web'
    for name in ('customer-entry.css', 'customer-entry.js'):
        source, destination = assets / name, site / name
        if source.resolve() != destination.resolve():
            shutil.copyfile(source, destination)
    if 'src="customer-entry.js"' not in html:
        backup = site / 'index.html.before-customer-entry'
        if backup.exists():
            raise SystemExit('BLOCKED: backup exists; review current index before reapplying.')
        shutil.copyfile(page, backup)
        html = html.replace('</head>', '<link rel="stylesheet" href="customer-entry.css">\n'
                            '<script src="customer-entry.js" defer></script>\n</head>', 1)
        page.write_text(html, encoding='utf-8')
    print('PASS: customer entry installed locally; no deployment performed.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('site_root', type=Path)
    apply(parser.parse_args().site_root.resolve())
