# Manual Smoke Results

Date:
Tester:

Prep confirmed:
- `npm run smoke`: PASS
- `npm run smoke:web`: PASS
- `npm run smoke:prepare`: PASS

Test values:
- Founder secret: `oasis-local-founder`
- Vault file: [founder-directive.txt](./smoke-assets/founder-directive.txt)
- Browser smoke screenshot: [ui-smoke.png](./smoke-assets/ui-smoke.png)

## 0. Browser UI Smoke

Status: PASS

Checks:
- Page load:
- Terminal shortcut:
- HTTP errors:
- Runtime errors:

Visible errors:

Notes:

## 1. Sentinel Vault

Status: PASS / FAIL

Checks:
- Login with founder secret:
- Seal real file:
- Ledger updated:
- Unseal restored file:

Visible errors:

Notes:

## 2. Boardroom

Status: PASS / FAIL

Checks:
- Open panel:
- `SUMMON LOCAL ORACLE`:
- Real response rendered:

Visible errors:

Notes:

## 3. Terminal

Status: PASS / FAIL

Checks:
- `status`:
- `audit`:
- `ls --strategic`:

Visible errors:

Notes:

## 4. Workforce

Status: PASS / FAIL

Checks:
- Open panel:
- Tasks loaded:
- Proposals loaded:

Visible errors:

Notes:

## Summary

Overall:
- PASS / FAIL

Next fix target:
