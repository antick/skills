# Platform Migration

Move a defined product surface with an explicit parity and rollout contract.
A web build running in a simulator is not proof of native platform parity.

## Establish source, target, and scope

Read instructions, source architecture, runtime/framework versions, supported OS
versions, storage, authentication, backend contracts, native modules, deployment,
and tests. Confirm source and target platforms and the intended framework if not
specified. Do not choose a rewrite merely because a preferred stack is available.

Create a parity matrix of user journeys and platform capabilities: navigation,
deep links, auth callbacks, permissions, offline behavior, notifications, background
work, files, camera/media, purchases, accessibility, analytics, and updates where
used. Mark required, intentionally different, deferred, and unavailable items.
Record acceptance evidence per target rather than using one overall checkbox.

## Design the migration boundary

Separate portable domain logic and data contracts from platform UI, storage,
network/lifecycle integration, and permissions. Reuse code only where semantics
match; browser storage and native secure storage are not interchangeable.
Verify target SDK and distribution constraints using current official docs.

Plan identity continuity, stored-data formats and migration, backend compatibility,
mixed old/new clients, and recovery. Preserve app/package identifiers, callback URLs,
entitlements, and signing ownership unless changes are explicitly required.
Account setup, signing changes, production data migration, store submission, and
publication need authorization; prepare the artifacts without assuming it.

## Build a vertical slice, then complete parity

Start with a representative end-to-end flow through UI, shared logic, service,
and persistence. Use it to validate target build tooling and platform adapters.
Then migrate remaining matrix entries in coherent groups. Preserve public API
contracts or update OpenAPI and compatible clients together.

Keep the source client working until replacement criteria are met. If both clients
write data, define conflict handling and version compatibility. Avoid unbounded
dual writes or removing old storage before a verified recovery path exists.
Use official migration guides/codemods where suitable and inspect generated code.

When dependencies change, check compatibility and publication dates, pin exact
stable versions at least 48 hours old, and retain the project's package manager.
List unsupported libraries and concrete replacements rather than stubbing a
feature while calling it migrated.

## Verify each target

Run shared and platform-specific tests, type/lint/build checks, and clean target
builds. Exercise permission denied, offline/reconnect, app suspension/termination,
deep links, logout/account changes, and data upgrade on relevant platforms.
Use browser, simulator/emulator, and real-device evidence distinctly. Hardware,
push, background execution, purchases, signing, and store behavior may require
device or distribution checks; name the remaining work precisely.

Report the parity matrix, intentional differences, data compatibility, rollout
and recovery plan, artifacts built, and exact verification per platform. Do not
retire the source or publish the replacement until the requested acceptance and
external-action authorization are satisfied.
