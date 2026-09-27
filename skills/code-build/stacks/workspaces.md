# Turborepo workspace

Use when the repository already uses Turborepo or the user selects it for multiple
applications/packages. Combine this guide with the guide for each affected app.
Retain another working workspace/task system when no migration was requested.

## Stack decisions

Use the existing workspace package manager, typically pnpm when selected for a new
Turborepo project. Each application can keep its own framework and runtime.
Shared packages should have real consumers and clear exports.

## Map ownership before editing

Read workspace membership, package manifests, exports, dependency links, root
scripts, and the task graph. Identify the package that owns the change and the
applications that consume its output. A shared directory name is not evidence
that an application can import it: confirm the declared dependency and export.

Keep application-specific behavior in its application. Move code to a shared
package only when its actual consumers can use the same contract without pulling
in incompatible runtime dependencies.

## Build path

1. Identify the owning package, its workspace dependencies, and downstream
   consumers. Use the root package manager for installation and filtering.
2. Add only requested applications and shared packages. Define exports and
   workspace dependency links using the package manager's supported mechanism.
3. Keep browser-safe modules separate from server-only dependencies. Check
   shared UI peer dependencies and avoid shipping duplicate framework runtimes.
4. Configure task dependencies so consumers build after required packages. Match
   task syntax to the installed Turborepo version and the actual package scripts.
5. Declare cache inputs, outputs, and relevant environment variables. Keep
   persistent development servers out of normal cached task execution. Add remote
   caching only when authorized and useful for the team's workflow.
6. Wire application-specific development, build, test, and deployment commands.
   Keep deployment artifacts complete even when their dependencies are workspace-local.

## Verify

Run the affected package's checks and its consumers' checks from the root. Verify
build ordering, exports, clean installation, and packaged/deployed file inclusion.
For changed cache configuration, confirm changed inputs invalidate the right tasks.
Check a clean build without existing generated artifacts; a warm workspace can
hide missing exports, undeclared dependencies, and incomplete task ordering.
