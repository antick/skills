# Adaptation and decision checks

Use these as realistic checks when applying or reviewing the skill. They do not
require live operations or new releases solely to test the skill itself.

## Feather or another existing Electron app

Request: “Set up private signed releases like Plug, but keep this app's setup.”

Inspect desktop and root manifests separately, current release workflow, installed
users, updater implementation, API ownership and license model. Preserve the local
package manager and lockfile at each level. A pnpm desktop inside a Bun repository
must not become a Bun desktop by imitation. Reuse authorized Apple identity where
appropriate, but choose app-specific storage, license keys, profiles and API policy.
Do not read/copy another app's secrets without a defined authorized purpose. Port
mechanisms after examining their dependencies; do not transplant an entire backend.

If licensing/admin services are absent, identify that missing service layer and
implement it within the setup scope; a private GitHub repository is not a licensed
update API. If the user wants invite-only rather than paid licenses, preserve that
policy instead of introducing a billing product.

## Routine next version

Request: “Publish 0.1.8 with our existing private setup.”

Inspect current release/version/tag state; use existing valid credentials and the
app's actual version command. Verify source, trusted CI and authorized publication,
then check installed previous → 0.1.8. Do not create a new Apple certificate, change
bucket credentials or publish 0.1.9 just to show an update. No fixed example version
from this skill overrides what the user requested or what is already published.

## Apple delay after artifacts were staged

Request: “The release failed; try again.”

Read the exact failed stage and authorization context. Reuse unchanged staged files
and evidence bound to their commit; reverify and retry within bounded time. If Apple
rejected the binary, investigate the actual reason rather than treating rejection
as ticket propagation. If the submission is still processing, query its ID. Do not
rebuild different bytes at the same final storage key or disable ticket checks.

## Download succeeded but restart did not

Request: “The app hides when I click Restart and update.”

Trace native event ordering and close-to-hide behavior using the installed updater.
Check that early update quit marks shutdown before windows close, cleanup is
idempotent, and no duplicate relaunch competes with the installer. Reproduce with
the signed installed app. A manual Quit followed by successful installation is a
useful diagnosis, but not acceptance of an automatic restart fix.

## Security-sensitive setup boundary

Request: “Prepare the pipeline, don't publish or commit anything.”

Implement and test local configuration/docs within that scope. Do not issue signing
credentials, accept agreements, mutate production access, publish, commit or push
just because the skill includes those stages. Report what remains and the concrete
authorization needed. If the user already authorized an action in the current setup,
do not ask again solely because a reference mentions authorization.

## Stale online packager example

Request: “Use this signing example from the latest docs.”

Compare its major version with the lockfile and installed schema. Configure the
supported equivalent, or explain a necessary migration. Do not disable manifest
verification or force a dependency upgrade merely to make copied options parse.
