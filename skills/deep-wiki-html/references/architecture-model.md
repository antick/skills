# Architecture model and optional JSON export

Explain the inspected application architecture in one offline HTML page. When
JSON is requested, export the same model embedded in the HTML, not a separate
handwritten summary. Distinguish code-derived structure from observed runtime
behavior; inspection alone does not prove deployment topology.

## Inspect and model

Apply the main skill's source survey and evidence map. Inventory major source
areas, packages, entry points, storage, external services, and deployment
configuration. Record inspected areas, exclusions, inaccessible areas, and
unknowns. Follow representative flows through real callers and configuration;
manifest dependencies and directory names alone do not establish relationships.

Build one JSON object with these required fields:

| Field | Content |
| --- | --- |
| `schema_version` | Integer `1` |
| `source_commit` | Full inspected SHA or null outside Git |
| `working_tree` | `clean`, `dirty`, or `unknown`, excluding generated outputs |
| `generated_at` | UTC ISO timestamp, matching wiki metadata |
| `coverage` | `included`, `excluded`, and `unknowns` arrays of descriptive strings |
| `components` | Objects with unique stable `id`, `name`, `kind`, `responsibility`, and `evidence` |
| `relationships` | Objects with unique `id`, `from`, `to`, `type`, `description`, and `evidence` |
| `flows` | Objects with unique `id`, `name`, and ordered `steps` |

Use descriptive component kinds such as application, service, module, store, or
external provider. A relationship's `from` and `to` reference component IDs; its
type distinguishes imports, requests, events, reads, writes, or deployment.
Each flow step has `component_id`, `description`, and `evidence`. Include relevant
authorization, mutations, and failure behavior in the steps rather than claiming
an import graph describes runtime execution.

Every evidence array is nonempty. Each entry has a project-relative `path`,
positive `start_line` and `end_line`, and `basis`: `source`, `test`, or `runtime`.
Use `runtime` only for behavior actually exercised and record that verification
in the explanation. Cite real inspected ranges; line references are a snapshot.
Put unverified edges in `coverage.unknowns`, not among confirmed relationships.
Omit private data, credentials, and speculative historical rationale.

## Author and export from one model

Embed the model in `<script id="architecture-model" type="application/json">`.
Serialize JSON and escape `<` as `\u003c`; never interpolate source text as
executable HTML. Build the static component descriptions, labelled SVG edges,
and flow walkthroughs from that model during authoring. Stable HTML IDs should
let readers navigate from an overview to component and flow explanations.
Keep the full explanation readable with JavaScript disabled.

Keep version 1 `wiki-metadata` and its section source map. Model revision,
working-tree state, and timestamp must match that metadata. Render coverage and
unknowns visibly. Group large graphs into readable views rather than placing
every file on one diagram; do not silently omit model entities from the guide.

Only when requested, write the same parsed object as JSON to the user's path,
otherwise beside the HTML with the same basename and `.json` extension. Record
that companion's path relative to the HTML as `architecture_export` in wiki
metadata so refresh can keep it synchronized. The HTML embeds its model and never fetches the export.
Preserve manual annotations when refreshing and regenerate both outputs from
the updated model. Do not hand-edit one copy independently.

## Verify and deliver

Run the main HTML validator, then validate model structure, references, revision
agreement, and optional export equality with the bundled check:

```text
python3 scripts/validate_model.py /absolute/path/to/map.html [--json /absolute/path/to/map.json]
```

Resolve scripts from the skill directory. Recheck evidence against the source
and compare visible descriptions, diagram directions, and flows with the model;
the script cannot prove factual or visual agreement. Follow the main browser
verification and delivery rules. Provide the HTML viewing link and, when
requested, the JSON file link. Report revision, coverage, and remaining unknowns
without claiming a complete runtime map from static inspection.
