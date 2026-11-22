# DRIFT Public Showcase — Zod (TypeScript / Vitest)

Public, reproducible showcase of **[DRIFT](https://github.com/rad-ox/drift)** (schema `0.3`, `drift.mjs` bridge + independent MIT Python verifier `verifier/drift_verify.py`) integrated on a real, non-HTTP TypeScript validation library: **[colinhacks/zod](https://github.com/colinhacks/zod)**.

- **Pinned upstream commit (`main`):** `2a343ed2a4ffbea73fb83862ee1e317662292481`
- **DRIFT baseline branch:** `drift-baseline`
- **DRIFT version:** `v0.10.0` (schema `0.3`, dual `dr2b`/`dr2a` seals, `policy.require_observations = true`)
- **Test runner:** Vitest (`zod` runtime + `compile-mode` AOT + TypeScript `tsc` typecheck)

## Approved Behavioural Contracts

- `.drift/config.toml` — Area owner (`rad-ox`), approver allowlist, and `require_observations = true`.
- `.drift/profiles/zod-parse@1.toml` — Reusable scalar validation profile (`mode`, `input_json` → `success`, `issue_count`, `issue_code`, `issue_path`, `output_json`, `has_optional`).
- `.drift/contracts/object-required-fields.toml` — 5 cases governing required vs optional properties, type mismatches, and non-object inputs on `z.object().safeParse()`.
- `.drift/contracts/object-unknown-keys.toml` — 3 cases governing `strip`, `strict`, and `passthrough` unknown-key policies.
- `packages/zod/src/v4/classic/tests/object.drift.test.ts` — Vitest TypeScript suite bound via `tools/drift-bridge/drift.mjs` (`runDriftCase` + `d.check`).

## Reproduce Locally

```bash
nub install --frozen-lockfile
mkdir -p .drift-work/resolved .drift-work/events
drift show .drift/contracts --as json --out .drift-work/resolved
DRIFT_RESOLVED=.drift-work/resolved DRIFT_EVENTS=.drift-work/events \
  nub exec --node vitest run packages/zod/src/v4/classic/tests/object.drift.test.ts
drift gate .drift/contracts --events .drift-work/events --json
python3 verifier/drift_verify.py .drift/contracts --config .drift/config.toml --events .drift-work/events --json
```

## Demo Pull Requests (against `drift-baseline`)

1. **`demo/false-green`** — Regression makes required field `name` optional (`z.string().optional()`) and weakens the Vitest assertion so `Vitest` passes **GREEN** (false green), while both `drift gate` and `verifier/drift_verify.py` fail **RED** (`bound` < `verified`, missing observations).
2. **`demo/valid-fix`** — Behaviour-preserving improvement to issue-path formatting and coverage → both `Vitest` and `DRIFT Gate + drift_verify.py` stay **GREEN** (0 false reds).
3. **`demo/free-limit`** — Transparent boundary demonstration of [`GUARANTEES.md §1.1`](https://github.com/rad-ox/drift/blob/main/GUARANTEES.md) (Vector B: hardcoded literal actuals passed to `d.check` without invoking the SUT): `Vitest` and **DRIFT Free** both pass **GREEN**, documenting why isolated acceptance tests or `proof = "killed"` (`drift mutants --when`, Enterprise) are required to close that vector.
