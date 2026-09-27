# Review output

Lead with findings. Do not add empty category headings or a praise section.

```markdown
## Findings

### [BLOCKER] Short, specific title

**File:** `path/to/file.ts:42`
**Issue:** What is wrong and the concrete trigger or unmet requirement.
**Impact:** The observable failure or meaningful risk.
**Solution:** The smallest practical correction.

## Evidence checked

- Reviewed range: `<base>...<head>, pull request head SHA, or working-tree scope`
- Requirements: `<issue, ticket, specification, or PR discussion used>`
- Verification: `<tests and checks actually observed>`

## Gaps

- `<inaccessible context or verification that could not be completed>`
```

Omit `Gaps` when there are none. When there are no actionable findings, start
with `No actionable findings.` and still state the evidence checked and any
remaining gaps.
