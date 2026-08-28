# Open Learn Core

Open Learn Core is an open-source framework for building reproducible, auditable learning resources from structured educational source and publishing them across web, print, and video. V2.0 dogfoods the framework with a complete introductory linear algebra course.

## Architecture

```text
core/                         shared schemas, validation, graph, quality, renderer
domains/<domain>/              domain manifest, content, assets, tests, working files
docs/                         architecture and contribution documentation
tests/core/                   shared Core tests
tests/integration/            repository and build-layout tests
dist/                         generated portal, course, and publication outputs
```

Core owns the reusable engine. A domain owns its knowledge, sources, visuals, curriculum, and quality-gate configuration. Core does not assume a particular subject or content path.

## Current domain

`linear-algebra` is the first reference domain. It contains 8 ordered Modules, 52 structurally authored Learning Units, Module exercises with complete solutions, five cumulative reviews, three video source pilots, and reproducible web/PDF/video publication adapters. The deterministic forensic audit currently treats the Unit prose as a scaffold pending deeper editorial review; the Knowledge Layer (Concepts, Relations, Evidence) remains separate from the Learning Layer (Course → Module → Unit).

## Commands

```bash
npm run validate:domain -- linear-algebra
npm run build:domain -- linear-algebra
npm run test:domain -- linear-algebra
npm run validate:all
npm test
npm run course:audit -- linear-algebra
npm run build -- linear-algebra
npm run build:pdf -- linear-algebra
npm run build:video -- linear-algebra
npm run publish:manifest -- linear-algebra
npm run publication:audit -- linear-algebra
npm run package:offline -- linear-algebra
```

The generated site is written to `dist/`, with the portal at `dist/index.html` and domain output under `dist/domains/<domain>/`. The PDF, video index, publication manifest, and offline textual package are build artifacts. Large media is intentionally not committed to normal Git history.

## Tooling and publication

Node.js 20+ is required. The web compiler needs only Node. PDF rendering uses Pandoc and LuaLaTeX; video source validation uses the tracked BiimSlideMaker-compatible protocol, while local rendering can additionally use Marp CLI, ffmpeg, and the optional VOICEVOX Engine. See [docs/pdf-pipeline.md](docs/pdf-pipeline.md) and [docs/publication.md](docs/publication.md).

Cloudflare Pages/Workers Static Assets is the replaceable web host, and R2 is the reference origin for large artifacts. Configure deployment through environment variables from [.env.example](.env.example); no production credential is required for CI tests or local web builds. GitHub remains the canonical source and tagged releases can attach versioned PDF, HTML, offline, and checksum artifacts.

## Licensing

Source code is MIT licensed in [LICENSE](LICENSE). Original educational content is CC BY-SA 4.0 as described in [LICENSE-CONTENT.md](LICENSE-CONTENT.md). External references and licenses are recorded in `domains/linear-algebra/data/sources/sources.json`.

## Adding a domain

Create `domains/<domain>/domain.yaml`, place the domain data and assets below that directory, and run the domain validation, tests, and build commands. See [docs/domain-system.md](docs/domain-system.md), [docs/repository-layout.md](docs/repository-layout.md), and [docs/asset-policy.md](docs/asset-policy.md).

## Roadmap

The v2.0 non-blocking roadmap includes learner accounts, adaptive grading, multilingual expansion, additional domains, and hosted analytics. The basic course remains static, inspectable, and usable without a proprietary service.
