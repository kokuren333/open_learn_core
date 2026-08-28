# V2.0 publication workflow

GitHub is the canonical editable source. `dist/` is reproducible output: the static web edition is suitable for Pages/Workers Static Assets, large media and generated binaries are intended for R2, and tagged GitHub Releases can carry versioned snapshots.

## Local build

```text
npm install
npm test
npm run validate:all
npm run course:audit -- linear-algebra
npm run build -- linear-algebra
npm run build:pdf -- linear-algebra
npm run build:video -- linear-algebra
npm run publish:manifest -- linear-algebra
npm run publication:audit -- linear-algebra
npm run package:offline -- linear-algebra
```

`build:pdf` writes a structured Markdown source and, when Pandoc/LuaLaTeX are available, `linear-algebra.pdf`. `build:video` copies validated source packages and writes `video/build-index.json`; MP4/WAV rendering remains optional and generated media is ignored by Git.

## Configuration

Use `domains/linear-algebra/config/publication.yaml` for non-secret defaults and `.env.example` for environment variable names. `SITE_BASE_URL` and `ASSET_BASE_URL` can be changed without editing Unit source. The build never writes a build-machine absolute path into learner-facing HTML.

Cloudflare credentials are required only by a deployment job, not by ordinary tests or pull requests. `npm run deploy:cloudflare -- linear-algebra` deploys `dist/` to Pages, and `npm run publish:r2 -- linear-algebra` uploads generated PDF/video/offline artifacts under a stable versioned R2 prefix. Both commands fail safely when credentials are missing; set `DEPLOY_DRY_RUN=1` to inspect the exact plan without credentials.

## Release traceability

`publish:manifest` records course version, source commit, artifact paths, byte sizes, SHA-256 checksums, license metadata, and the configured asset base URL. Run it after building from the release tag; the resulting `publication-manifest.json` is the handoff to a Pages/R2 or GitHub Release workflow.

The offline package contains HTML, CSS, local concepts, Units, exercises, reviews, small assets, and manifests. Video binaries are excluded by default so the textual course remains downloadable without the production host. `npm run package:release -- linear-algebra` creates versioned HTML/PDF/offline/source-manifest archives and `checksums.txt` under the ignored `dist/release/` directory for GitHub Release attachment.
