# Shanhe startup intro: pre-merge security review

## Scope
Base: `9e6dc9588590cb7c3461a530136d34d3a7880a73`.
Production implementation reviewed: `a2a2f4b8b74e31b2b1893dafd02c8bcd333520aa`.
The subsequent pre-merge changes add keyboard and documentation tests, bilingual guides, an English-guide packaging entry, and review evidence. They do not alter the reviewed runtime code.

## Findings
No confirmed findings at confidence >= 8. No unresolved HIGH or CRITICAL findings.

## Data-flow checks
- The current theme ID comes from the existing validated gallery controller. The intro only selects the developer-authored Shanhe catalog entry.
- Theme copy is passed to React as text children, not innerHTML. The CSS uses the existing compiled scene variable; no remote assets or user-authored CSS are added.
- The existing selection fetch still uses a fixed same-origin route and credentials policy. No host endpoint, authentication boundary, arbitrary URL fetch, file-serving path, or deserializer was introduced.
- The intro controller only owns timers and subscriptions. The bounded restore decision, user-selection suppression, and every exit path were tested.
- Browser tooling loads trusted local dependencies from an explicit operator-provided directory. Its HTTP server binds to 127.0.0.1 and serves only hardcoded paths. Query values are serialized through JSON and validated by the real gallery controller.
- The generated offline preview inlines trusted build artifacts, escapes script terminators, and simulates the host response. It is not published in the plugin package.
- Package dependencies, host implementation, standalone themes, and runtime service requirements remain unchanged.

## Pre-merge validation
The fresh full test suite, minimum 80% source line coverage gate, minimum 95% intro line coverage gate, deterministic rebuild, syntax checks, and changed-path secret scan must all pass before pushing main.

## Known validation boundary
Real DSH/native desktop UAT is still pending. Browser tests use real React with simulated host services. No claim of completed real-host UAT or registry publishing is made.
