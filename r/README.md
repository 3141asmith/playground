# R workspace

A standalone Playground section at `r/`, linked from the home page. It runs actual R in the browser through **webR 0.5.8**, pinned to `https://webr.r-wasm.org/v0.5.8/` (R 4.5.1 when checked).

## Features

- Twelve editable examples: vectors, functions/loops, buffered input, data frames, missing-value summaries, CSV analysis, histograms, regression, grouped boxplots, binomial probability, bootstrap resampling and multiple plot pages.
- Base R expressions auto-print, including tables and fitted models. Console output, messages, warnings and errors are displayed as text, never interpreted as HTML.
- R's canvas graphics are captured at 900 × 600 and displayed in a plot gallery, with PNG download for each page. Up to twelve plot pages are displayed per run.
- Paste/upload CSV text, available as `csv_text` in the script's environment. The examples use `read.csv(text = csv_text)`; source uploads are limited to 250 KB and CSV uploads to 1 MB.
- Buffered `readline()` consumes pre-entered answers; exhausted input reports an error. Interactive R menus/debugger prompts are not supported by the GitHub Pages-compatible communication mode.
- Independent script drafts (source, CSV and input) are stored locally when browser storage is available. Import/export `.R`, reset confirmation, line numbers, two-space indentation and Ctrl/Cmd+Enter are supported.

## Runtime and boundaries

`engine.js` lazy-loads webR, explicitly selecting the `PostMessage` channel. This avoids requiring cross-origin isolation headers or a service worker on GitHub Pages. webR itself runs R off the UI thread. Stop calls `WebR.close()` to terminate that session; it works for busy loops without depending on unsupported cooperative interrupts. A subsequent run starts a new runtime.

Loading has a 120-second timeout. Execution has a separate 30-second timeout, started after the runtime is ready. Console output is streamed; exceeding 60,000 characters stops the session and the DOM has a separate 65,000-character cap. Plot pages are captured until evaluation completes; the twelve-page gallery limit is a display limit rather than a guarantee against arbitrary R memory allocation.

Each run uses a fresh R environment, with `csv_text` and a closure implementing buffered `readline()`. Strings enter via R object constructors, not interpolation into executable source. A webR shelter releases the environment and result proxies after capture. Plot bitmaps are closed after drawing or discarding. R's loaded packages, global options, explicit global assignments and in-memory filesystem can persist until Stop; this is not complete isolation between runs.

Base R and bundled statistics/graphics packages are available. Additional packages need compatible webR builds; arbitrary desktop packages, native compilation and OS integration are not promised. Runtime downloads need an internet connection. The page does not submit code or CSV data to an execution backend, although user-written R may request network access supported by its runtime. Browser-local drafts are not a substitute for downloading a copy.

This is a general R resource, separate from OCR topic coverage. Statistical examples explain assumptions and limitations; the toy datasets and fitted relationships are not evidence of causation or recommendations about a real population.

## Primary references

- [webR on static hosts and PostMessage limitations](https://docs.r-wasm.org/webr/latest/serving.html)
- [Evaluating R and capturing conditions](https://docs.r-wasm.org/webr/latest/evaluating.html)
- [Graphics capture](https://docs.r-wasm.org/webr/latest/plotting.html)
- [R language manuals](https://cran.r-project.org/manuals.html)

The scripts and interface are original Playground code. R and webR retain their upstream licensing and credits; the runtime remains hosted by the webR project.

## Validation

Run `tests/r-workspace.cjs` with the workspace Node runtime and Playwright. It uses real webR downloads and executes all twelve examples, checking numeric results, plot counts and PNG bytes, CSV upload, input exhaustion, warnings/messages, syntax/runtime errors, fresh variables, saved drafts, source import/export, indentation, Stop/restart, output limiting, mobile layout, home-page discovery and failed-runtime-download recovery. Set `PLAYGROUND_URL` to the deployed Playground root to run it against GitHub Pages.
