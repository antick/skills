---
name: interview
description: Interview the user in depth about their life, priorities, preferences, and context, and save what they explicitly authorize to memory. Use when the user asks to be interviewed or to build a personal profile through conversation.
---

# Interview

Learn what will make future assistance more useful through a thoughtful, adaptive
conversation. Reviewing, installing, or editing this skill does not start an
interview or authorize storing personal information.

## Start from what is already known

Read available memory according to the host's rules and inspect the current
conversation. Identify useful gaps, possible outdated facts, and contradictions.
Do not repeat questions whose answers are already available. Treat prior memory
as context to verify when needed, not an unquestionable profile.

Infer the interview's focus from the request: life broadly, work, goals, habits,
relationships, preferences, or a particular transition. Start with an open question
that helps choose depth, such as what currently matters most and why. Do not
require the user to complete a demographic form before a useful conversation.

## Conduct an adaptive interview

Ask one substantial free-text question at a time, with a small related follow-up
only when it helps. Use the host's ask-user-question tool for genuine choices if
available; otherwise ask naturally in chat. Do not force nuanced experiences into
multiple-choice answers or invent a tool that the host does not expose.

Follow the user's answers with concrete examples, tradeoffs, constraints, and
changes over time. Move from broad context to depth instead of racing through
a fixed questionnaire. Useful areas, selected for relevance, include:

- Current priorities, long-term goals, and what success would look like.
- Work responsibilities, creative projects, strengths, and recurring frustrations.
- Routines, energy, learning preferences, and how decisions get made.
- Important relationships, commitments, interests, and practical constraints.
- What kind of assistance helps, what feels intrusive, and what should be avoided.

Let the user skip, redirect, correct, pause, or stop. Do not press for traumatic,
sexual, medical, financial, or third-party details merely to make the profile more
complete. Never request passwords, tokens, recovery codes, or identity documents.
Separate the user's statements from your interpretation; do not invent diagnoses,
personality labels, motives, or sensitive attributes.

## Save useful context honestly

If the user explicitly asks to save the interview, that authorization covers the
relevant answers they choose to share; do not ask again after every ordinary fact.
Without save authorization, keep the interview conversational and ask before any
persistent write. Respect statements such as "off the record" immediately.

Use only the host's supported memory mechanism and obey its location, format,
and update rules. Discover capability before promising persistence. Never place
personal notes in a source repository, commit, PR, shared document, or external
service by default. If memory is unavailable, say so and offer a summary for the
user to retain; do not claim it was saved.

Save concise factual summaries that preserve the user's meaning, not a verbatim
transcript or unsupported inference. Distinguish durable preferences from temporary
circumstances and dated goals. Check for duplicates and conflicts; ask when a
contradiction affects future advice. Use the host's correction/deletion mechanism
rather than silently retaining both incompatible versions. Minimize unnecessary
third-party identifying details and especially sensitive information; clarify
scope when sensitive retention is not clearly intended.

Write at natural checkpoints so a long session does not lose authorized context.
Verify each write through the tool result or allowed readback and report failures.
Saving a correction request is not proof an underlying memory has been deleted.

## Close or pause naturally

Summarize the important things learned, what was actually saved, what was excluded,
and useful topics still unexplored. Invite corrections without presenting the
profile as complete. If the user wants to continue, ask the next relevant question;
otherwise stop without manufacturing new interview tasks or reminders.
