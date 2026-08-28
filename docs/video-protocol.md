# Video Source Protocol

Open Learn keeps `script` and `spoken_script` separate in every canonical video source. `script` is the subtitle and display source; `spoken_script` is the pronunciation-oriented input for TTS. The adapter writes ignored compatibility files under `domains/<domain>/video/generated/biim/` and never replaces the canonical subtitle text.

The tracked `slides.md` files follow the first-party [BiimSlideMaker](https://github.com/kokuren333/BiimSlideMaker) Marp + YAML protocol inspected at the pinned revision in `core/config/biim-slide-maker.yaml`. The v1.9 auditor checks the title class, explicit highlight reset, low slide density, absence of fenced code blocks, sequential slide IDs, and one-to-one slide counts.

Run `npm run video:setup` to clone or verify the pinned local toolchain, `npm run video:audit -- linear-algebra <unit>` to audit a source, and `npm run video:build -- linear-algebra <unit>` to produce a build plan and compatibility artifacts. Actual rendering additionally requires Marp CLI, ffmpeg, and a running configured TTS engine.
