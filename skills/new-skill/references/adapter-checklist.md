# Adapter repository checklist

Use this when a project keeps canonical skills in one folder and exposes them
to several agent harnesses through adapters or symlinks.

## Files per skill

| Location | Contents |
| --- | --- |
| Canonical folder, such as `.agents/skills/<name>/` | The full `SKILL.md` and `agents/openai.yaml` |
| Each harness folder, such as `.claude/skills/<name>/` or `.cursor/skills/<name>/` | A thin adapter `SKILL.md` plus a copy of `agents/openai.yaml` |
| Symlink harnesses, such as `.pi/skills/<name>` | A directory symlink to the canonical folder |

Copy whichever harness folders the existing skills already have. A skill
missing from a harness folder cannot be invoked in that harness.

## Adapter body

Copy the canonical frontmatter verbatim, then point to the canonical file:

```markdown
Read and follow `../../../.agents/skills/<name>/SKILL.md` completely.
That canonical file defines the workflow and output contract. Pass the
user's request and arguments through unchanged.
```

Adjust the relative path to the real canonical folder. When canonical
frontmatter or metadata changes, update every adapter copy in the same change.

## Routing

When the repository instructions contain a task routing table or a skill list,
add or update the skill's row there as well.

## Validation

Check every canonical skill has its pair, matching names, a `$<name>` prompt,
and identical adapters:

```bash
fm() { awk 'NR==1&&/^---$/{f=1;next} f&&/^---$/{exit} f' "$1"; }
for d in .agents/skills/*/; do n=$(basename "$d")
  [ -f "$d/SKILL.md" ] && [ -f "$d/agents/openai.yaml" ] || echo "missing pair: $n"
  grep -q "^name: $n$" "$d/SKILL.md" || echo "name mismatch: $n"
  grep -qF "\$$n" "$d/agents/openai.yaml" || echo "prompt mismatch: $n"
  for h in .claude .cursor; do a="$h/skills/$n"
    [ -f "$a/SKILL.md" ] || { echo "missing adapter: $a"; continue; }
    cmp -s <(fm "$d/SKILL.md") <(fm "$a/SKILL.md") || echo "frontmatter drift: $a"
    cmp -s "$d/agents/openai.yaml" "$a/agents/openai.yaml" || echo "metadata drift: $a"
  done
done
```

Replace `.agents`, `.claude`, and `.cursor` with the folders the project uses,
and add a symlink check for symlink harnesses. Resolve every line it prints.
