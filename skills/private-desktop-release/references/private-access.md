# Private storage, licensing and administration

Use when building or changing licensed distribution. Keep the application's
existing business model; a private update feed does not require inventing billing,
cloud sync, trials or a new account system.

## Policy and records

Define access in the authoritative API, not in the UI or object URLs. Agree on:
license status, private-channel grant, device limit, update window, app block,
update-only block, deactivation and offline duration. Make the differences clear:
a permanent app license may outlast its update entitlement; disabling future
updates must not accidentally disable app access unless that is the product rule.

Use durable records with transactions and uniqueness constraints for license,
installation/device, release/artifact and events. Concurrent activation must not
consume more seats than allowed. Reissuing a license and deactivating a device must
have defined effects on existing tokens and offline proofs. Preserve real users'
data; do not assume another project is unreleased because the reference app was.

Bind credentials to the app/product, license and installation. For machine controls,
use a suitable OS hardware identifier and a scoped privacy-preserving derivation;
a network MAC address is mutable and is not a dependable machine identity. Document
reinstallation/hardware-change recovery and the limits of spoofable client input.
A hardware hash is still a persistent identifier, not a promise of anonymity.

Store installation credentials in platform-backed secure storage. Treat identifier
strings as opaque unless their contract explicitly defines a format. Accepting only
UUIDs can reject legitimate keys created by a different ID generator.

## Minimum service operations

Adapt names and schemas to the existing API; do not copy another app's routes.

| Operation | Required behavior |
| --- | --- |
| Installer lookup | Validate license/private grant/update eligibility; return an expiring authorized download; do not consume a device seat |
| Activate / validate / deactivate | Bound installation token, atomic seat allocation, explicit policy denial, safe recovery |
| Update check | Verify installation and license; choose eligible published version by channel/OS/architecture; prevent downgrade |
| Artifact authorization | Recheck eligibility; grant only the selected artifact, not arbitrary storage keys |
| Install authorization | Recheck online when product policy requires it, including already staged downloads |
| Events | Accept bounded authenticated reports with event identity/time; prevent replay inflation and cross-device writes |
| Admin license/device | Grant private access, edit update entitlement, block app or updates, deactivate; enforce server roles |
| Admin release | Draft, validate, publish, pause/resume; immutable artifact metadata and audited actor/reason |

Update the project's OpenAPI/schema contracts, migrations, clients and focused
permission tests together. Protect cookie-authenticated mutations from CSRF using
the existing framework conventions. Rate-limit key lookup/activation and avoid
license enumeration. Resolve release objects from verified server metadata; never
let a manifest import fetch arbitrary hosts or traverse bucket prefixes.

## Private object storage

Use the existing suitable provider. For R2, keep the bucket private and disable
public bucket/custom-domain access. Create separate credentials scoped to that
bucket: object read-only for the API and object read/write for release uploads.
Do not grant account-wide administration merely to upload artifacts. R2 permission
details are in [its authentication guide](https://developers.cloudflare.com/r2/api/tokens/).

The desktop must never receive an R2 secret, publisher token, GitHub PAT or Apple
key. Give it an installation credential to the API and short-lived, artifact-scoped
download authorization. If using presigned URLs, treat them as bearer credentials;
redact query strings, use short TTLs and avoid shared caching of private responses.
They cannot recall bytes already downloaded; see
[R2 presigned URL behavior](https://developers.cloudflare.com/r2/api/s3/presigned-urls/).

Verify updater metadata, ZIP and blockmap requests all remain authorized, including
redirects, range requests, resumed downloads and URL expiration. Do not forward
license headers across arbitrary origins. If the generic provider cannot preserve
needed authorization, implement a narrow adapter or API proxy and test it against
the installed updater version; do not assume a public-feed configuration is private.

## Offline access and UI

If offline use is wanted, return a signed, expiring proof bound to product, license,
installation and policy. Pin the verification public key in the production app;
keep its private key server-side. Check signature, audience and time boundaries,
including clock rollback behavior. Allow only the agreed offline grace for transient
network errors. Explicit online revocation/block must clear cached authorization;
do not reinterpret a 401/403 as a network outage. Explain that an offline device
cannot learn a new server block until it checks in or its proof expires. Choose the
grace duration with the owner; another app's 72 hours is not a required default.

Enforce app restrictions at the privileged operation boundary as well as the screen.
UI-only license gates can leave IPC or background services usable. Do not turn a
network outage into deletion of the user's local work.

Admin should show device label/platform, last contact, app version, app/update access,
release history and audit reason/actor using the project's date utility. Distinguish
server-authorized download from client-reported download completion and launch.
A launch report is not independent proof that a machine installed the app.

For update-window eligibility, prefer immutable server-assigned first-publication
time over a client-controlled build date. Pausing/resuming a release should not reset
that date or change its artifact hashes. Make entitlements and error messages explicit
without returning another customer's data, raw license key or internal storage URL.
