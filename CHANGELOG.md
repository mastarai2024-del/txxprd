# Changelog

All notable changes to this skill are documented here. Release tags follow Semantic Versioning where practical.

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
