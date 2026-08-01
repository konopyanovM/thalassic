---
name: claude-md-rules
description: Write or edit rules in CLAUDE.md so they match the file's house style — general, timeless, standalone, and correctly placed. Use whenever adding, rewording, or reorganizing a convention/rule in CLAUDE.md (or any project instructions file), or when the user says "add a rule", "remember this convention", or "document how we do X".
---

# Writing CLAUDE.md rules

CLAUDE.md is the project's standing instruction set, loaded into every session. A rule added here is read later by people and models with **no access to the conversation that produced it**. Write accordingly.

## Core principles

1. **General, not chat-specific.** State the durable principle and convention. Never reference "what we discussed", "as decided above", the current task, or a decision still being debated. If the reader can't understand the rule without the originating conversation, rewrite it.
2. **Timeless.** No change-history wording (`added`, `moved`, `now`, `for now`, `can be added later`). Describe how things *are*, in the present tense — mirroring the repo's "Comments are timeless documentation" convention.
3. **Don't document the unbuilt.** Cite durable external standards (specs, WCAG, Apple HIG, WAI-ARIA) and existing code, not config sections, classes, or files that are only planned. If the mechanism doesn't exist yet, describe the principle generally instead of naming the not-yet-real thing.
4. **Prescriptive.** Say what to do and what never to do, not just what's nice. The existing rules use imperatives and explicit "never …" clauses.
5. **No duplication.** Before adding, check whether a rule already covers it — extend the existing bullet rather than adding a near-duplicate.

## House style

Match the format of the surrounding bullets:

- **Shape:** a top-level `-` bullet that opens with a short bold-ish lead-in term, then `—` or `:`, then the rule. Example lead-ins already in the file: `RTL / direction-awareness — …`, `BEM class naming: …`, `Spacing — …`.
- **Density:** these are dense, complete paragraphs, not one-liners. Cover the *why* briefly, the *how*, the edge cases, and the exceptions in the same bullet.
- **Examples:** include a concrete code example only when it illustrates a **timeless technique**, not a one-off. Inline backticks for short tokens; fenced blocks (with a language) for multi-line SCSS/TS. Keep examples minimal.
- **Exceptions belong in the rule.** State the "reserve X for the rare case where …" / "the only exception is …" carve-outs explicitly, as the existing rules do.
- **Naming in examples** follows the repo's own conventions (full descriptive names, logical CSS properties, spacing tokens, etc.) — an example that violates another rule undermines the file.

## Placement

CLAUDE.md is grouped into sections (`## Code conventions`, `## Frontend architecture`, `## Motion / animations`, …). Put the rule in the section it belongs to, next to related rules (e.g. accessibility rules cluster together, SCSS-ordering rules together). Read the neighbours first so the new bullet's phrasing and altitude match theirs.

## Procedure

1. Read the target section of CLAUDE.md to absorb tone, altitude, and format, and to check for an existing rule to extend.
2. Draft the rule general and standalone — no conversation references.
3. Place it in the right section, adjacent to related rules.
4. Re-read it cold: would someone with zero context understand and apply it? If not, revise.

## Anti-patterns

- ❌ "As we discussed, prefer X" / "the new approach is X"
- ❌ Referencing a config/class/file that is planned but not built
- ❌ A vague one-liner where the existing rules are thorough paragraphs
- ❌ A duplicate of an existing rule instead of extending it
- ❌ An example that breaks another CLAUDE.md convention
