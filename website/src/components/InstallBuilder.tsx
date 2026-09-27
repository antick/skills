import { useState } from "react";
import { ArrowUpRight, Terminal, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { CopyButton } from "./CopyButton";
import { agents, skills, installCommand } from "@/lib/catalog";
import { site } from "@/lib/site";

export default function InstallBuilder() {
  const [skill, setSkill] = useState("all");
  const [agent, setAgent] = useState("codex");
  const [scope, setScope] = useState("global");
  const command = installCommand(skill, agent, scope);
  return (
    <div className="install-builder">
      <div className="install-controls">
        <div><label htmlFor="install-skill">Choose your skills</label><Select value={skill} onValueChange={setSkill}><SelectTrigger id="install-skill"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All {skills.length} skills</SelectItem>{skills.map((item) => <SelectItem key={item.name} value={item.name}>{item.name}</SelectItem>)}</SelectContent></Select></div>
        <div><label htmlFor="install-agent">Your agent</label><Select value={agent} onValueChange={setAgent}><SelectTrigger id="install-agent"><SelectValue /></SelectTrigger><SelectContent>{agents.map((item) => <SelectItem key={item.id} value={item.id}>{item.displayName}</SelectItem>)}</SelectContent></Select></div>
        <div><label htmlFor="install-scope">Install for</label><Select value={scope} onValueChange={setScope}><SelectTrigger id="install-scope"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="global">All your projects</SelectItem><SelectItem value="project">One project</SelectItem></SelectContent></Select></div>
      </div>
      <div className="install-terminal">
        <div className="terminal-topbar"><span><Terminal size={15} /> Your terminal</span><span>Node.js 24 + Git</span></div>
        <div className="terminal-step"><div><span className="step-number">01</span><span>Get the collection</span><CopyButton text={site.cloneCommand} label="Copy clone command" /></div><pre><code>{site.cloneCommand}</code></pre></div>
        <div className="terminal-step"><div><span className="step-number">02</span><span>Install your selection</span><CopyButton text={command} label="Copy install command" /></div><pre aria-live="polite"><code>{command}</code></pre></div>
        <div className="terminal-bottom"><Check size={14} /><span>Restart your agent. You’re ready to go.</span></div>
      </div>
      <p className="install-note">{scope === "project" ? "Replace /path/to/project with your project’s directory. " : "Installs in your home directory. "}Reinstalling replaces selected skill folders, so back up any edits first.</p>
      <a className="text-link" href={`${site.repository}#install-from-a-checkout`} target="_blank" rel="noreferrer">All installation options <ArrowUpRight size={16} /></a>
    </div>
  );
}
