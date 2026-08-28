# Open Learn Core

Open Learn Core is a domain-independent learning-content compiler. It turns structured concepts, evidence, lessons, exercises, visuals, and curricula into validated static learning sites.

## Architecture

```text
core/                         shared schemas, validation, graph, quality, renderer
domains/<domain>/              domain manifest, content, assets, tests, working files
docs/                         architecture and contribution documentation
tests/core/                   shared Core tests
tests/integration/            repository and build-layout tests
dist/                         generated portal and domain sites
```

Core owns the reusable engine. A domain owns its knowledge, sources, visuals, curriculum, and quality-gate configuration. Core does not assume a particular subject or content path.

## Current domain

`linear-algebra` is the first reference domain. Its content is intentionally staged: `basis` is the current quality-gate concept, while the remaining concepts make the prerequisite graph and curriculum structure visible.

## Commands

```bash
npm run validate:domain -- linear-algebra
npm run build:domain -- linear-algebra
npm run test:domain -- linear-algebra
npm run validate:all
npm run build:all
npm test
```

The generated site is written to `dist/`, with the portal at `dist/index.html` and domain output under `dist/domains/<domain>/`.

## Adding a domain

Create `domains/<domain>/domain.yaml`, place the domain data and assets below that directory, and run the domain validation, tests, and build commands. See [docs/domain-system.md](docs/domain-system.md), [docs/repository-layout.md](docs/repository-layout.md), and [docs/asset-policy.md](docs/asset-policy.md).

## Roadmap

The repository currently optimizes for a single-domain MVP while preserving a clean path to multiple domains. Future work can add domain-specific packages or repositories without changing the Core contracts.
