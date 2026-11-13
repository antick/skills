# Document explainer

Turn a supplied document into a visual explanation suited to its reader. Preserve
its meaning, limitations, and uncertainty. A document explainer describes what
the source says; it does not establish that its claims are true or implemented.

## Resolve the source and destination

For an existing explainer, recover the source identity from `document_sources`
when the request does not supply it again. Use its recorded locator to retrieve
the document; a logical section identity alone is not a filesystem path. If the
source cannot be retrieved, request the missing material and preserve the
existing output. Do not substitute repository code or a Git survey for it.

Read the complete relevant document with the available file or connected-source
tools. If it cannot be accessed, request the missing material and state the limit;
do not infer the content from a title or URL. For a large or partially readable
source, explain only the inspected sections and disclose omissions.

Use the user's destination, otherwise reuse an existing explainer identified by
its metadata and source identity. For a new output, use `docs/document-explainer.html`
in a project or `document-explainer.html` in the working directory outside a project.
Preserve an unrelated existing file; choose a descriptive source-specific name
when that default is already occupied. Do not replace the repository wiki.

## Explain for the reader

- Infer audience and purpose from the request. Organize around questions the
  reader needs answered, rather than mechanically copying source headings.
- Explain key concepts, relationships, steps, tradeoffs, and exceptions in plain
  language. Preserve qualifications, disagreement, and stated uncertainty.
- Place diagrams, worked examples, comparisons, or interactive controls beside
  the concepts they clarify. Use interaction only when it improves understanding;
  provide a static explanation so the meaning survives without JavaScript.
- Cite consequential explanations to source headings, page numbers, or stable
  section IDs. Label added examples and interpretations. Separate documented
  behavior from any requested comparison with inspected code.
- Use brief quotations only when necessary and permitted. Paraphrase faithfully;
  an explainer is not a copy of the source. Exclude credentials and private data.

## Author and refresh

Use the main skill's HTML shell, semantic sections, navigation, inline SVG,
escaping, accessibility, and offline rules. Keep version 1 `wiki-metadata` and add
`kind: "document-explainer"` plus a `document_sources` array. Each source has
`id`, `title`, `locator`, and `revision` fields; use a stable URL, project-relative
path, or descriptive attachment identity as locator, and null for an unknown
revision. Avoid private absolute filesystem paths and credential-bearing URLs.

Map each HTML section's metadata source array to project-relative document paths
or logical identities such as `documents/specification`. Add visible citations
with the actual heading/page locator; these logical identities are not fake file
links. Outside Git, use `source_commit: null` and `working_tree: "unknown"`.
Keep the main skill's UTC ISO timestamp format and visible freshness note.

On refresh, re-read the source and existing explainer, not just Git changes.
Compare document versions or content where available. Preserve manual additions,
styling, stable section IDs, and audience. Reconcile contradictions explicitly.
Update source identities, citations, and timestamps only after verification;
leave unchanged files alone when the source and explanation remain current.

## Verify and deliver

Run the main HTML validator and recheck each consequential claim and diagram
against the inspected document. Check that examples are labelled, caveats remain,
and controls do not change the source's meaning. Apply the main skill's browser
checks when available, stating anything unrun. Deliver a prominent **Open document
explainer** link, source/version, coverage, and verification limits. No codebase
survey or architecture JSON is needed unless the user requests it.
