import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const pluginDirectory = path.dirname(fileURLToPath(import.meta.url));
const skillsDirectory = path.resolve(pluginDirectory, "../../skills");
const commands = JSON.parse(
  readFileSync(new URL("../../pi-extension/commands.json", import.meta.url), "utf8"),
);

export default async function skillsPlugin() {
  return {
    config: async (config) => {
      config.command ??= {};
      for (const [name, description] of Object.entries(commands)) {
        config.command[name] = {
          description,
          template: `Load and follow the \`${name}\` skill for this request:\n\n$ARGUMENTS`,
        };
      }

      config.skills ??= {};
      config.skills.paths ??= [];
      if (!config.skills.paths.includes(skillsDirectory)) {
        config.skills.paths.push(skillsDirectory);
      }
    },
  };
}
