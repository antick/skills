import { readFileSync } from "node:fs";

const commands = JSON.parse(readFileSync(new URL("./commands.json", import.meta.url), "utf8"));

export default function skillsExtension(pi) {
  for (const [name, description] of Object.entries(commands)) {
    pi.registerCommand(name, {
      description,
      handler: async (args, context) => {
        const request = String(args || "").trim();
        const message = request ? `/skill:${name} ${request}` : `/skill:${name}`;

        if (context?.isIdle?.() === false) {
          pi.sendUserMessage(message, { deliverAs: "followUp" });
          context?.ui?.notify?.("Antick Skills queued your request as a follow-up.", "info");
          return;
        }

        pi.sendUserMessage(message);
      },
    });
  }
}
