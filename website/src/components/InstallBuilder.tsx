import { ArrowUpRight, Terminal, Check } from "lucide-react";
import { CopyButton } from "./CopyButton";
import { site } from "@/lib/site";

export default function InstallBuilder() {
  return (
    <div className="install-builder">
      <div className="install-terminal">
        <div className="terminal-topbar"><span><Terminal size={15} /> Your terminal</span><span>Node.js</span></div>
        <div className="terminal-step"><div><span className="step-number">01</span><span>Install, then pick your skills and agents</span><CopyButton text={site.installCommand} label="Copy install command" /></div><pre><code>{site.installCommand}</code></pre></div>
        <div className="terminal-step"><div><span className="step-number">02</span><span>Update later</span><CopyButton text={site.updateCommand} label="Copy update command" /></div><pre><code>{site.updateCommand}</code></pre></div>
        <div className="terminal-bottom"><Check size={14} /><span>Restart your agent. You’re ready to go.</span></div>
      </div>
      <p className="install-note">Installs in your home directory, so every project gets the skills. Reinstalling replaces skill folders, so back up any edits first.</p>
      <a className="text-link" href={`${site.repository}#install`} target="_blank" rel="noreferrer">Install, update, and remove <ArrowUpRight size={16} /></a>
    </div>
  );
}
