# Manual Smoke Checklist

Use this after `npm run dev` or `npm run dev:clean`.

Prep:

```powershell
npm run smoke
npm run smoke:web
npm run smoke:prepare
```

Expected prep values:
- Founder secret: `oasis-local-founder`
- Vault test file: [founder-directive.txt](./smoke-assets/founder-directive.txt)
- Browser smoke screenshot: [ui-smoke.png](./smoke-assets/ui-smoke.png)

## 0. Browser UI Smoke

Goal:
- confirm the web UI loads without browser-side runtime or asset errors

Run:

```powershell
npm run smoke:web
```

Pass if:
- page load is `OK`
- terminal shortcut is `OK` or at least no runtime failure appears
- HTTP errors are `OK`
- runtime errors are `OK`

## 1. Sentinel Vault

Goal:
- confirm real auth
- confirm real seal/unseal flow

Steps:
1. Open `Sentinel Vault`
2. Login with `oasis-local-founder`
3. Seal [founder-directive.txt](./smoke-assets/founder-directive.txt)
4. Confirm the file appears in the vault ledger
5. Unseal it
6. Confirm the file is restored to the same path

Pass if:
- auth succeeds
- ledger updates
- unseal restores the file

## 2. Boardroom

Goal:
- confirm local oracle response path

Steps:
1. Open `Boardroom`
2. Click `SUMMON LOCAL ORACLE`
3. Wait for the oracle result

Pass if:
- response appears
- no runtime error shows
- content is clearly not placeholder text

## 3. Terminal

Goal:
- confirm live backend commands

Run:
- `status`
- `audit`
- `ls --strategic`

Pass if:
- commands return output
- output reflects current backend state
- no command bridge error appears

## 4. Workforce

Goal:
- confirm panel load and command wiring

Steps:
1. Open `Workforce`
2. Wait for tasks/proposals to load

Pass if:
- panel opens
- no lazy-load error
- no Tauri invoke error

## Notes

Record any failures with:
- panel name
- exact action
- visible error text
- whether `npm run smoke` still passes
