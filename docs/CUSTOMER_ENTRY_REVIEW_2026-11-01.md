# HYRAM GOLF customer entry review

## Visitor behavior

- Korean header labels and four task-based entry links: lesson, fitting, club purchase, used-club sale.
- Short consultation form asks only the topic and optional question. It performs no network submission or browser storage.
- Preparing/copying a draft never displays a successful submission. A separate explicit link opens the existing Kakao group chat for manual sending.
- Clipboard-denied handling exposes a selectable readonly draft. Editing a question invalidates the previous draft.
- Phone link, keyboard focus outlines, reduced-motion support, and 48px form buttons.
- Mobile bottom actions include catalog and consultation, with safe-area padding and chat-launcher spacing.
- On the current public template, the old detailed scheduling form is retained inside an expandable section. Existing #reserve and field deep links open it.

## Source / publication finding

On 2026-11-01, browser inspection of `https://www.hyramgolf.kr/` redirected to `https://hyramgolf.kr/`. The live homepage uses `catalog.html`, `lesson.html`, `expert-home.css`, `site-polish.js`, `requestForm`, and `expert-header`. These files/markers do **not** match this repository's main homepage at `3c15141cc4de6d9876b4595cffca528ad7dbf753`, which uses `shop.html` and `hero-copy`.

The existing GitHub Pages workflow deploys `web/` after main changes. Therefore, merging this PR alone is not evidence that the observed public domain was updated. Confirm the actual public host and source before any production publication. Do not replace the live homepage with the different repository template to force a release.

The additive CSS/JS supports both observed templates. To apply it to a **confirmed local checkout** of the current public site:

```sh
python qa/apply_customer_entry.py /absolute/path/to/confirmed-public-site
```

The helper copies the two UI assets and adds stylesheet/defer-script references. It creates `index.html.before-customer-entry` once; keep this local backup out of the published directory. The helper neither deploys nor changes any account, payment, domain, D1, or Worker settings. The public page copy used for browser QA is an ignored local snapshot, not an authoritative editable hosting repository.

## Verification

| Check | Result |
| --- | --- |
| JavaScript syntax, Python compilation, git diff whitespace | PASS locally |
| GitHub template: topic selection and draft generation | PASS in preview browser |
| Current public template snapshot: Korean navigation, task links, minimal form, old form collapsed | PASS in preview browser |
| Actual Kakao delivery / phone call | NOT TESTED; no customer message or call sent |
| Mobile 375 / 390px flow, clipboard fallback, stale draft, overflow, existing shop regression | See PR CI; do not infer PASS from added tests |
| Galaxy Chrome / Samsung Internet | NOT TESTED |
| Official domain release | BLOCKED until public hosting/source is confirmed and owner approves publication |

No new inventory, price, qualification, membership entitlement or policy claim is introduced. Existing claims and independent payment/DB release gates are outside this UI change.
