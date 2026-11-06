# OpenMausBot CLI and server updates

Use alongside the registry for OpenMausBot, MausBot, or a headless deployment.
Check the current official [terminal setup](https://github.com/milind-soni/OpenMausBot/blob/main/docs/cli-onboarding.md),
[self-hosting](https://github.com/milind-soni/OpenMausBot/blob/main/docs/self-hosting.md),
and [VPS update guide](https://github.com/milind-soni/OpenMausBot/blob/main/docs/deploy-vps.md)
before choosing commands. Desktop support limits do not establish headless support.

## Inventory before choosing a route

Keep three report rows: **OpenMausBot CLI**, **OpenMausBot Server**, and
**OpenMausBot Desktop (MausBot)**. CLI and Server can share a package; record that
ownership and update it once. Verify each row independently.

- Resolve all `openmausbot` executable paths and wrappers, owning manager,
  package version, prefix, runtime, and OS user. Inspect npm global metadata
  under the relevant runtime/account, not just the interactive shell's npm.
  Bare `openmausbot` starts setup/server workflows; `npx` can install a missing
  package. Inventory from existing files and metadata first, then use only
  installed, documented read-only version/help commands.
- Inspect existing processes and launch definitions: systemd `ExecStart`, user
  and working directory; launchd program arguments; container image/digest,
  Compose project/service; or source checkout and launch script. An installed
  but stopped service still counts as installed. Read only needed launch fields;
  redact credentials rather than dumping environments or whole configurations.
- Record `OMB_DATA_DIR` or `--data-dir` overrides, ports, runtime path, and
  service-account package prefix. Preserve these, engine credentials, browser
  state, volumes, and workspace data. `~/.openmausbot` is only the default.
- Distinguish a local server from a CLI targeting `OPENMAUSBOT_URL`/`--url` on
  another host. Update the local client within scope; report a remote backend
  out of scope unless that host is explicitly authorized and accessible.

## Update through the actual owner

| Existing route | Update and activation |
| --- | --- |
| npm package / service | Resolve the selected published release and existing prefix. When safe to stop the service, stop it, update as its OS user with that runtime's npm (for example `npm install --global --prefix <existing-prefix> openmausbot@<verified-version>`), check success, then start the same service and verify it. For other managers use their owning route. A service restart alone does not update the package. |
| Source checkout | Verify upstream remote, release/channel, clean working tree, and current revision. Preserve local edits and pins; block on divergence rather than resetting. Fast-forward to the selected revision, install locked dependencies and rebuild using current upstream instructions and that checkout's scripts, then activate through its existing launcher. Report the revision when no reliable version exists. |
| Container / Compose | Inspect the existing image source, tag/digest, mounts, and service name. Pull the selected official image and recreate only that service, or rebuild its existing source-based image as documented. Preserve volumes and configuration; never use `down -v`. A pinned digest stays pinned unless changing it is approved. Verify the running image digest and backend health after activation. |
| Embedded Desktop server | Update the owning desktop artifact once. Verify its embedded backend independently after a safe restart; a standalone npm update does not replace the embedded server. Keep a separate standalone backend, if present, tied to its own owner. |

Use the existing channel/pins and check dependencies before mutation. Missing
Node, pnpm, Docker, engine CLIs, or desktop prerequisites remain subject to the
main skill's explicit-install rules. Updating a service is not permission to
create one, launch onboarding, configure remote access, or install Desktop.

Before stopping or replacing any server, inspect active bot turns/routines and
whether it hosts this session. Defer disruptive activation while work is active;
use `staged` only when an update was actually prepared and verified. Preserve a
stopped service's stopped state. Follow upstream backup guidance before changing
persistent state; use a consistent backup if required, preserving the actual
data directory and separately stored credentials. Report a failed update or
start with the resulting service state; never label it updated on npm exit alone.

## Verify the running backend

Verify the resolved CLI version/package in a fresh shell and the executable
actually used by the service. Independently check backend version/revision or
image identity and health using its documented endpoint or the existing CLI's
read-only `doctor` command against the correct URL/port. A missing engine or
sign-in can make `doctor` fail even when the server is healthy: report that
readiness blocker separately. If activation is deferred, distinguish the new
installed artifact from the still-running old backend. Report exact future
owner-specific update commands as manual unless automation was verified.
