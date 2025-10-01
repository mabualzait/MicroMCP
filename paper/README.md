## Paper (IEEE LaTeX)

This folder contains a draft academic paper for Micro‑MCP using the IEEEtran class.

### Build

Prereqs: TeXLive/MacTeX or another LaTeX distribution with `pdflatex` and `bibtex`.

```
cd paper
pdflatex main.tex && bibtex main && pdflatex main.tex && pdflatex main.tex
open main.pdf
```

### Notes

- Figures are copied into `paper/figures/` with sanitized filenames for LaTeX/Overleaf. Update or replace as needed.
- Bibliography: `references.bib`.
- Template: IEEEtran (two-column conference style).


