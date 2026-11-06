# Code health

Check every change for the five categories below and report each finding under
its heading in the output. Look only at code the change adds, changes, or leaves
unused; leave older problems elsewhere alone. A finding needs a concrete cost (a
bug risk, a maintenance or testing burden, or a behavior change) and a specific
fix. Personal style preferences are not findings.

- **Code smells:** duplicated logic or state, misleading names or comments,
  functions doing several unrelated jobs, a new pattern where the repository
  already has one for the same job, and redundant tests that repeat the same
  setup, boundary, and assertion.
- **Coverage gaps:** missing or ineffective regression tests, judged with
  [test-quality.md](test-quality.md).
- **Dead code:** functions, exports, components, branches, flags, config,
  styles, imports, or commented-out code that the change adds without a caller
  or leaves without one. Search the whole repository for callers, including
  dynamic imports, string-based registration, and scripts, before calling
  something unused, and cite the search. Tests that only assert removed names
  belong here too. Code the repository deliberately keeps so old and new
  versions can run together during deployment is not dead; say so instead of
  reporting it.
- **Over-engineering:** apply **Unnecessary complexity** below.
- **Side effects:** behavior the change alters outside its requirements. Trace
  shared helpers, packages, schemas, styles, and API contracts to every caller,
  including other applications in the repository, stored data, background
  jobs, emails, audit events, and the window when old and new versions run
  together. Changes the requirements or description document as intended are
  not findings.

## Unnecessary complexity

Check whether the change is the smallest complete solution to the actual
requirements. Inspect callers, existing helpers, and repository patterns before
concluding that a mechanism is unnecessary.

- Look for speculative abstractions or configuration, pass-through wrappers,
  one-off frameworks, duplicated state or logic, needless branches, and custom
  machinery that the standard library, a native platform feature, or an
  installed dependency already covers. Check whether caching, retries,
  dependencies, and optimizations solve a demonstrated problem.
- Establish what the extra mechanism contributes today and whether a simpler
  existing pattern or direct flow preserves every supported behavior. Do not
  demand abstractions solely to remove a few repeated lines, or reject a useful
  abstraction solely because it has one caller today.
- Preserve necessary architecture, security, validation, error handling,
  accessibility, reliability, and deployment compatibility. Line counts, file
  counts, personal style, and hypothetical future problems do not establish
  over-engineering. Do not propose unrelated refactors or clever compressed code.
- Cite the exact mechanism and location, explain why the requirements do not
  need it, demonstrate its cost, and propose the smallest concrete
  simplification while naming the behavior and safeguards that must remain.
  For example, duplicated derived state needs two update paths and extra tests
  when one computed value would preserve the behavior.
- Base severity on demonstrated impact. A concrete maintenance or testing
  burden is a valid finding even when current behavior works; do not invent a
  runtime failure. Omit vague "too complex" findings that cannot name both a
  real cost and a viable simpler solution.
