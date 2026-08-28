# openlearn-course-architect

## Purpose
Separate the Knowledge Graph from the learner-facing Course and define explicit Course and Module routes.

## Contract

- Read structured Domain artifacts before writing.
- Keep Core contracts domain-independent and preserve evidence boundaries.
- Emit inspectable tracked source artifacts; generated media belongs only in ignored generated directories.
- Report uncertainty and missing prerequisites instead of silently inventing content.

## v1.9 Rules

For video work, canonical script is readable subtitle text and spoken_script is pronunciation-oriented TTS input. For Course work, the explicit Course → Module → Learning Unit sequence is authoritative; do not infer learner order by walking the Knowledge Graph.
