# PDF Pipeline

Learning Units are converted into a structured, monochrome-safe Markdown source. Module and Course documents use the same adapter, with a table of contents for the larger document. When Pandoc and LuaLaTeX with `luatexja` are installed, the source is compiled to an A4 PDF with native LaTeX math. Without those external binaries, the command still writes and audits the inspectable Markdown source and reports the missing tools without silently claiming a PDF was produced.

Examples:

```text
npm run pdf:check
npm run pdf:unit -- linear-algebra basis-definition
npm run pdf:module -- linear-algebra module-vector-spaces
npm run pdf:audit -- linear-algebra unit-basis-definition
```

Generated PDF sources and media live below ignored `domains/*/pdf/generated/` directories. Canonical Unit data remains the single source for HTML and PDF adaptation.
