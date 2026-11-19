# Exam paper builder

Static browser-local PDF question selector for Playground. No account, backend, OCR, API key or upload of source documents. Upload multiple PDFs, select rectangular question regions, group continuations, reorder questions, and export a combined A4 paper. Fictional example papers are generated locally.

## Behaviour and limits

- Selection is manual, with pointer/touch dragging, whole-page selection or precise percentage coordinates. PDF.js renders the source in its displayed orientation, including source rotation and CropBox handling. Fit-page and fit-width views do not change the selection coordinates.
- Question groups can contain multiple regions from any source pages. Regions stay in the order added; whole questions can be reordered. Source PDFs used by a question cannot be removed until those sections are removed.
- Exports use PNG crops rendered at 180 or 300 dpi and laid out on A4. Large regions scale down to fit the printable area. Render buffers are limited to 24 million pixels / 10,000 pixels per dimension, which can reduce resolution for exceptionally large source pages.
- Only selected crop pixels are embedded; hidden content from outside the selection is not copied into the output. This is a question assembly tool, not a document redaction service. Question text is rasterised, so output is not text-searchable/editable or tagged for screen readers. Scanned source quality cannot be improved by choosing a higher dpi.
- Original printed question numbers remain. Optional question headings, title, page numbers and source references use standard PDF fonts. Unsupported characters in those added labels are replaced with `?`; original question glyphs are preserved in their rendered images.
- Interactive forms, annotations, attachments and source document scripts are not included. PDF JavaScript actions are not executed. Password-protected PDFs are rejected.
- Limits: 20 source papers, 50 MB per file, 150 MB total, 500 pages per source and 200 selected regions. Work remains in memory and clears on refresh/navigation; download the output before leaving. Failed imports retain existing work. Export errors retain selections for retry.

## Dependencies

- Vendored Mozilla PDF.js / pdfjs-dist 5.4.624, Apache-2.0 (`vendor/PDFJS-LICENSE.txt`): https://mozilla.github.io/pdf.js/
- Vendored pdf-lib 1.17.1, MIT (`vendor/PDFLIB-LICENSE.txt`): https://pdf-lib.js.org/
- PDF.js loads supplemental character maps, standard font data and image-decoder WASM from the pinned jsDelivr distribution when required. Requests contain asset URLs, never source PDFs. Fonts used by the interface come from Google Fonts.

Validation: `node tests/paper-builder.cjs` with the repository's local server running. Set `PLAYGROUND_URL` to run against a deployment. The test creates its own PDFs and checks multi-source assembly, continuations, ordering, scanned/rotated sources, crop pixel exclusion, output layout/dimensions, invalid files, downloads and mobile overflow.
