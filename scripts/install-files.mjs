import { cp, lstat, mkdir, mkdtemp, realpath, rename, rm, symlink } from "node:fs/promises";
import path from "node:path";

// Resolve existing ancestors too, including when the install directory is new.
export async function resolveDirectory(directory) {
  const absolute = path.resolve(directory);
  try {
    return await realpath(absolute);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    const entry = await lstat(absolute).catch((failure) => {
      if (failure.code !== "ENOENT") throw failure;
      return null;
    });
    if (entry) throw new Error(`Cannot resolve installation directory: ${absolute}`);
    return path.join(await resolveDirectory(path.dirname(absolute)), path.basename(absolute));
  }
}

export async function resolveDestinations(destinations, boundary) {
  const resolved = [];
  for (const destination of destinations) {
    // A final skill symlink is replaced, not followed. Its parents must stay inside the scope.
    const parent = await resolveDirectory(path.dirname(destination));
    const relative = path.relative(boundary, parent);
    if (relative === ".." || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      throw new Error(`Installation destination escapes ${boundary}: ${destination} (parent resolves to ${parent})`);
    }
    resolved.push(path.join(parent, path.basename(destination)));
  }
  return [...new Set(resolved)];
}

export async function installSkill(skill, destinations, { copy, boundary }) {
  const staged = [];
  try {
    // Stage every destination before replacing any existing copy of this skill.
    for (const destination of destinations) {
      const [checked] = await resolveDestinations([destination], boundary);
      if (checked !== destination) throw new Error(`Installation destination changed: ${destination}`);
      await mkdir(path.dirname(destination), { recursive: true });
      const temporary = await mkdtemp(path.join(path.dirname(destination), ".skills-install-"));
      const entry = {
        destination,
        temporary,
        replacement: path.join(temporary, "new"),
        backup: path.join(temporary, "old"),
        backedUp: false,
        installed: false,
      };
      staged.push(entry);
      if (staged.length === 1 || copy) {
        await cp(skill.directory, entry.replacement, { recursive: true, dereference: true });
      } else {
        const target = process.platform === "win32"
          ? destinations[0]
          : path.relative(path.dirname(destination), destinations[0]);
        try {
          await symlink(target, entry.replacement, process.platform === "win32" ? "junction" : undefined);
        } catch {
          await cp(staged[0].replacement, entry.replacement, { recursive: true, dereference: true });
        }
      }
    }

    for (const entry of staged) {
      const [checked] = await resolveDestinations([entry.destination], boundary);
      if (checked !== entry.destination) throw new Error(`Installation destination changed: ${entry.destination}`);
      try {
        await rename(entry.destination, entry.backup);
        entry.backedUp = true;
      } catch (error) {
        if (error.code !== "ENOENT") throw error;
      }
      await rename(entry.replacement, entry.destination);
      entry.installed = true;
    }
  } catch (error) {
    const failures = [error];
    for (const entry of staged.toReversed()) {
      try {
        if (entry.installed) await rm(entry.destination, { recursive: true, force: true });
        if (entry.backedUp) {
          await rename(entry.backup, entry.destination);
          entry.backedUp = false;
        }
        await rm(entry.temporary, { recursive: true, force: true });
      } catch (failure) {
        // Keep the backup if rollback itself fails; never delete the user's last copy.
        failures.push(new Error(`Recovery files retained at ${entry.temporary}: ${failure.message}`));
      }
    }
    if (failures.length > 1) throw new AggregateError(failures, failures.map((failure) => failure.message).join("\n"));
    throw error;
  }

  for (const entry of staged) {
    await rm(entry.temporary, { recursive: true, force: true });
  }
}
