# Changelog

All notable changes to this skill are documented here. Release tags follow Semantic Versioning where practical.

## Unreleased - 2026-10-22

### Added

- Numbered native heading hierarchy for nested PRD sections, including third and deeper levels, with outline checks and examples.
- Acceptance groups organized by page or function and mapped to feature requirements, retaining prerequisites, actions, observable results, existing check states, and unresolved rules.
- Guidance for concrete user-facing effect descriptions and read-only field rendering, scoped to the current confirmed requirements.
- Mandatory post-write formatting checks: table-bound records stay inside the intended rows and cells; inspect outline, row/cell structure, neighboring blocks, and browser rendering, and repair format defects before delivery.
- HTML attachment troubleshooting that distinguishes validation failures, blocked native submission, save results, and stale errors; confirmed host restrictions can use a shared click/Enter handler with duplicate-submit checks.
- Guidance for scoped form drafts, separate prototype storage keys, and session-only operation when persistent storage is unavailable.
- Real-viewport scrolling and control-reachability checks, coordinate-system distinctions, and waiting for visible lazy-loaded images before diagnosing missing media.
- README examples and a troubleshooting section for HTML attachment previews, linked to the detailed authoring guide.

### Validation

- Skill metadata, local documentation links, XML examples, and Git whitespace checks.
- Official skill validation and relative-link/heading-anchor checks for the 2026-10-22 documentation update; no business-service operations were repeated while preparing it.
- Public changes contain generic guidance only; business document content, screenshots, private identifiers, and credentials stay outside this repository.

## v1.1.0 - 2026-10-18

### Added

- MasterGo source/target boundaries: source pages are read-only, temporary copies have explicit cleanup conditions, and the only writable page/file/node is recorded before design work.
- Independent image-layer checks for copied MasterGo assets. Designs must not depend on expiring `revisionId` URLs, temporary local addresses, `data:image` strings, or unresolved component instances.
- Post-submit verification guidance: accepted, queued, and similar responses are treated as processing receipts, not proof that a canvas change or screenshot is complete.
- Real-entry interaction acceptance for HTML prototypes, including source page → visible entry → modal/editor → cancel/back → save/delete → result.
- Multi-location Feishu synchronization checks for overview tables, feature tables, body references, images, and HTML attachments.
- PRD guidance separating document version, design version, prototype version, example data, and confirmed business rules.
- Public release notes and README coverage for layer integrity, source boundaries, and evidence levels.

### Changed

- Expanded the design fidelity gate to cover asset independence and native-canvas visual review, not only color and component alignment.
- Clarified that local screenshots, API read-back, downloaded hash equality, browser visual review, real device behavior, and server behavior are separate acceptance layers.
- Added reusable revision lessons from recent Feishu PRD and MasterGo work. The public package contains no project document URLs, private node IDs, account data, or business media.

### Validation

- Markdown structure and relative-link checks for the updated skill package.
- Git diff review confirming only documentation and skill guidance changed.
- No runtime, Feishu API, MasterGo canvas write, paid service, APP, or production deployment was performed while packaging this release.

### Known limitations

- MasterGo tool names and asynchronous behavior can change between MCP versions; always re-read the active server's tool descriptions.
- Feishu browser visual review may require a logged-in browser session; API read-back and downloaded asset hashes do not replace it.
- Font availability and platform fallback can differ from the design file. Record the fallback instead of claiming pixel-perfect typography.

## v1.0.0 - 2026-10-18

- Initial release with Feishu PRD authoring, comments, native whiteboards, HTML prototypes, acceptance checklists, MasterGo design-system setup, and minimum-scope diagnostics.
