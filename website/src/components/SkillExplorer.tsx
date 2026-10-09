import { ArrowDownRight, ArrowUpRight, Check, Code2, ScanLine, Scissors, MessageCircle, AlignLeft, RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { CopyButton } from "./CopyButton";
import { skills } from "@/lib/catalog";

const icons = { "code-review": ScanLine, "code-build": Code2, "code-audit": Scissors, concise: AlignLeft, "make-sense": MessageCircle, "upgrade-dependencies": RefreshCw };

export default function SkillExplorer() {
  return (
    <Tabs defaultValue="code-review" orientation="vertical" className="skill-explorer">
      <TabsList aria-label="Explore the skills" className="skill-list">
        {skills.map((skill, index) => {
          const Icon = icons[skill.name as keyof typeof icons];
          return (
            <TabsTrigger key={skill.name} value={skill.name} className="skill-tab">
              <span className="skill-tab-number">0{index + 1}</span>
              <span className="skill-tab-icon"><Icon size={20} strokeWidth={1.5} /></span>
              <span className="skill-tab-text"><strong>{skill.name}</strong><span>{skill.category}</span></span>
              <ArrowDownRight className="skill-tab-arrow" size={20} />
            </TabsTrigger>
          );
        })}
      </TabsList>
      {skills.map((skill) => (
        <TabsContent key={skill.name} value={skill.name} className="skill-detail">
          <div className="detail-topline"><span className="mono-label">/{skill.name}</span><span className="mode-pill">{skill.mode}</span></div>
          <h3>{skill.heading.split("\n").map((line, index) => <span key={line}>{index > 0 && <br />}{line}</span>)}</h3>
          <p className="skill-description">{skill.description}</p>
          <ul className="skill-steps">{skill.steps.map((step) => <li key={step}><Check size={15} />{step}</li>)}</ul>
          <div className="prompt-box"><span className="mono-label">TRY ASKING</span><p>{skill.prompt}</p><CopyButton text={skill.prompt} label="Copy prompt" /></div>
          <a href={skill.source} target="_blank" rel="noreferrer" className="text-link">Read the skill <ArrowUpRight size={16} /></a>
        </TabsContent>
      ))}
    </Tabs>
  );
}
