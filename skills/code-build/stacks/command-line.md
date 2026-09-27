# Command-line tool

Use for command-line applications and scripts. Keep the existing language and
runtime; Node.js/TypeScript is an option when chosen, not the only supported stack.

## Stack decisions

Establish how the command will be used: interactively, through a pipe, in CI, or
as part of another program. Define input precedence and a stable output/exit
contract for those consumers. Use the current parser and configuration loader;
for small new commands, check the runtime's built-in facilities first.

## Where the work belongs

| Responsibility | Owning part |
| --- | --- |
| Executable entry and argument parsing | Existing command entry point |
| Independent commands | Command modules when the interface needs them |
| File, network, or configuration operations | Shared implementation used by commands |
| Installable command name | Runtime/package executable metadata |
| Usage and exit behavior | Help text and command-level tests |

## Build path

1. Define arguments, flags, input sources, outputs, and exit behavior from the
   requested workflow. Validate incompatible or missing options before side effects.
2. Implement the operation separately from terminal presentation where it has
   reusable consumers. Keep results on stdout and diagnostics on stderr.
3. Offer prompts only for interactive terminals. Provide explicit arguments or
   flags for automation, and fail clearly when required input is unavailable.
4. Match color/progress output to the terminal and output mode. Preserve usable
   plain output and machine-readable formats when requested.
5. Protect existing files, clean up temporary resources, and handle cancellation
   during writes or long-running work without leaving misleading success output.
6. Configure the installed executable entry, shebang, permissions, and bundled
   runtime files. Document usage and build steps; publishing is a separate action.

## Verify

Run help, success, invalid input, and a relevant operational failure from a
temporary directory. Capture stdout/stderr and exit codes in tests. Exercise the
installed or packed command outside the source tree, including non-interactive use.
For commands that write files, test an existing destination and an interrupted
write. Verify the previous file remains usable unless replacement completed.
