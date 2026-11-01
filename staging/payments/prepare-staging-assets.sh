#!/usr/bin/env sh
# Pack ONLY staging browser assets. No secrets, no payment API in static files.
set -eu
cd "$(dirname "$0")"
mkdir -p public
cp checkout.html public/checkout.html
cp toss-checkout.js public/toss-checkout.js
printf '%s\n' '// STAGING WORKER ONLY: use this same-origin HTTPS gateway.' 'window.HYRAM_TOSS_TEST_API_ORIGIN = window.location.origin;' > public/toss-payment-config.js
printf '%s\n' "Prepared 3 staging-only public assets. Does not deploy."
