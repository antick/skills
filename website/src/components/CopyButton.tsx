import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "./ui/button";

export function CopyButton({ text, label = "Copy", className = "" }: { text: string; label?: string; className?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      setTimeout(() => setStatus("idle"), 2200);
    } catch {
      setStatus("error");
    }
  }
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Button variant="ghost" size="sm" onClick={copy} aria-label={`${label} to clipboard`} className="copy-button">
        {status === "copied" ? <Check size={15} /> : <Copy size={15} />}
        <span aria-live="polite">{status === "copied" ? "Copied" : label}</span>
      </Button>
      {status === "error" && <span role="status" className="text-xs">Select the command to copy it manually.</span>}
    </span>
  );
}
