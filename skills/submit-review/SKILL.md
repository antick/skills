---
name: submit-review
description: Publish completed code review findings on a GitHub pull request as one review of inline comments, then mark the pull request as draft. Tags the author and requests changes on someone else's pull request; posts untagged comments on the user's own pull request during self-review. Use when asked to submit, post, or publish review findings; a review-only request does not publish anything.
---

# Submit Review

Publish findings that a completed review (usually `code-review`) already
produced. Do not re-review from scratch or add new findings here. If there are
no actionable findings, make no changes and say so.

## Boundaries

- A request to submit findings authorizes posting one pull request review of
  inline comments and converting the pull request to draft. It does
  not authorize approving, merging, closing, labeling, assigning, or changing
  ticket or project status.
- Never post a finding you cannot anchor honestly or that no longer applies.
- Keep secrets and personal data out of comments; use sanitized examples.

## 1. Resolve the pull request and mode

1. Resolve the pull request from the request or an unambiguous pull request
   already established in the conversation. Read its author, state, draft flag,
   current head SHA, and changed files with `gh pr view`.
2. Read the authenticated user with `gh api user --jq .login`.
3. Choose the mode:
   - **Someone else's pull request:** tag `@<author>` at the start of every
     comment and submit with `event: REQUEST_CHANGES`.
   - **The user's own pull request** (self-review, including from
     `build-review-loop`): no username tag anywhere and submit with
     `event: COMMENT`. GitHub rejects requesting changes on your own pull
     request.

## 2. Recheck and anchor every finding

1. Fetch the current head. If it differs from the reviewed head, recheck each
   finding against the new code. Drop findings that the new commits fixed and
   report them as resolved; do not post stale findings.
2. Anchor each finding to the smallest relevant diff line or range, using the
   correct `path`, `line`, `side`, and, for ranges, `start_line` and
   `start_side`. The line must be part of the pull request diff.
3. For a Dead code or Side effects finding about an unchanged file, anchor it to
   the changed line that causes it (for example, the removed last caller or the
   shared change) and name the affected file in the comment.
4. If a finding cannot be anchored to any diff line, such as a repository-wide
   or merge-conflict finding, put it in the review body instead of inventing a
   location, and say so in the report.

## 3. Write the comments

Keep each finding's severity, its section, and its Issue, Impact, and Solution.
A Task finding uses `[SEVERITY] Task finding: Short title`; a Code health
finding names its category. Keep a blank line between labels so each renders as
its own paragraph:

```markdown
@<author> **[SEVERITY] Code health · Dead code: Short title**

**Issue:** What is wrong, with concrete evidence.

**Impact:** What can break or why it matters.

**Solution:** The smallest correct remediation.
```

Omit the `@<author>` tag in self-review mode. Keep the wording plain and
direct: short sentences, no filler, jargon explained once. Tighten padded or
robotic phrasing before posting without changing a finding's meaning or
evidence.

The review body is short: the number of Task findings and the number in each
Code health category that has findings, plus any unanchored findings.

## 4. Submit in one review

Write the review as a JSON file and post it with structured input, never by
interpolating text into shell code:

```json
{
  "commit_id": "<verified head SHA>",
  "event": "REQUEST_CHANGES",
  "body": "<counts and unanchored findings>",
  "comments": [
    { "path": "src/file.ts", "line": 42, "side": "RIGHT", "body": "<comment>" }
  ]
}
```

```bash
gh api repos/<owner>/<repo>/pulls/<number>/reviews --method POST --input review.json
```

Post every finding in this single review. Do not post ordinary conversation
comments as a substitute for inline findings. If GitHub rejects a comment's
anchor, fix the anchor or move that finding to the body and retry once; if the
review still fails, report the exact error. Before any retry after an uncertain
result, list the pull request's reviews to avoid a duplicate post.

## 5. Mark the pull request as draft

After the review is posted, run `gh pr ready <url> --undo` unless the pull
request is already a draft. Report a permission failure rather than retrying.

## Report

Give the review link, the event used, the number of inline comments, findings
moved to the body, findings dropped as already fixed, and whether the pull
request is now a draft. Verify these against GitHub before reporting; never
claim a post that did not succeed.
