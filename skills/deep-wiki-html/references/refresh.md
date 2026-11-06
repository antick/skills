# Refresh an HTML wiki

Read the existing file's visible content and `wiki-metadata` JSON. Reuse audience,
depth, scope, section IDs, and custom styling unless the user changes them. Treat
unrecognized metadata as a migration requiring a source survey, not as permission
to discard manual content.

## Determine what changed

Resolve the recorded commit in the actual repository. If it is missing, outside
the current history, or unavailable in a shallow clone, survey the requested
scope again. Do not silently claim an incremental refresh succeeded.

For an available ancestor, compare its tree with HEAD, then include staged,
unstaged, renamed, deleted, and relevant untracked files. Use Git's name-status
output with NUL delimiters when parsing filenames. Exclude the wiki destination
itself from source changes. A previously dirty/unknown snapshot has no complete
Git baseline: re-read all mapped sources and survey scope for added modules.
Outside Git, also re-survey instead of inventing a revision.

Intersect changed paths with the section source map. Follow affected callers,
shared interfaces, configuration, and tests: a path match alone cannot identify
all changed explanations. New packages, removed modules, manifest changes, and
renames can require navigation, setup, architecture, and glossary edits even
when no old section names those paths. Re-read affected files before writing.

## Update without losing the reader's work

Patch affected sections in place. Preserve unrelated prose, IDs, user notes,
and cross-links. When handwritten content contradicts inspected code, reconcile
it explicitly in the update note rather than silently deleting it. If authorship
is unclear, retain useful material and mark the conflict for review.

Retire obsolete sections and their navigation links together. Repair inbound
anchors or keep a useful redirect anchor when readers may have bookmarked it.
Recheck citations and line ranges across the whole file: lines can move in a
shared source even when a particular claim's meaning stays the same. Retain
older pinned citations only when deliberately labelled as historical evidence.

Update source mappings, revision, timestamp, and working-tree state only after
verification. Ignore the output HTML when deciding whether inspected sources
are dirty. Document the changed areas and remaining gaps in a short visible
update note. A refreshed file remains the sole deliverable; its own embedded
metadata is sufficient to start the next refresh.

## Keeping an active repository current

Keep the HTML in version control so documentation changes can be reviewed with
source changes. Refresh after changes to behavior, public interfaces, setup,
configuration, or system structure; an unrelated cosmetic change need not
regenerate the guide. If inspection finds nothing relevant to update, leave
the file unchanged and report that result to avoid timestamp-only churn.

For frequent development, a scheduled agent run against the default branch can
refresh daily or weekly and propose a documentation PR only when content changes.
A post-merge workflow can instead invoke an already configured coding agent for
faster updates. Both require separate automation setup and agent access; the
static HTML and validator do not run an agent themselves. Configure either only
when requested. Exclude wiki-only changes from the trigger to avoid update loops.

Every automated run must use the same evidence, preservation, and verification
rules as a manual refresh. Keep one writer per output file to avoid concurrent
updates overwriting each other. The visible revision and date describe the last
verified snapshot, not a promise that the guide always matches the latest code.
