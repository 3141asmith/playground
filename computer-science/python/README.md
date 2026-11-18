# Python workspace

A static GitHub Pages-compatible Python editor/runner, linked from the SLR 9 encryption topic and the Computer Science hub. The script library is on the left on desktop and above the editor on narrow screens.

## Runtime

- Real CPython runs through **Pyodide 0.29.3**, pinned to `https://cdn.jsdelivr.net/pyodide/v0.29.3/full/`. First run needs connectivity to download the WebAssembly runtime and its standard library.
- `loadPackagesFromImports` loads compatible distribution packages when needed. The modern examples use the distribution's `cryptography` package (46.0.3 when checked), rather than handwritten substitutes or browser-output simulations.
- Code runs in a dedicated Web Worker so the interface remains responsive. Stop terminates the worker, including an infinite loop or an in-progress download; the next run starts a new runtime. This works without cross-origin isolation headers or `SharedArrayBuffer`, which suits GitHub Pages.
- A 30-second execution timeout starts after imports/packages load. Runtime/package loading has a separate 120-second timeout. Output is streamed in batches and limited to 50 KB per run to avoid flooding the UI. The UI also caps displayed text.
- `input()` consumes pre-entered lines in order. Each run starts reading those lines again; exhausted input produces the normal Python EOFError. This is buffered input, not a live interactive terminal.
- Each run uses a fresh Python globals dictionary, with `student.py` as the traceback filename. Loaded modules and the in-memory filesystem may remain in the worker until Stop or navigation; this is not a claim of complete runtime isolation between runs.
- The page does not submit source code or messages to an execution service. Runtime/package downloads go to the CDN. User-written Python can perform whatever browser-compatible operations its code requests; the worker is for responsiveness, not an extra security boundary against arbitrary code.

## Editor

A labelled textarea provides real editable source, a synchronised line-number gutter, four-space Tab/Shift+Tab indentation, newline indentation and Ctrl/Cmd+Enter execution. Each example and the custom workspace have separate locally saved source/input drafts; failures or quota restrictions fall back to session memory. `.py` import/export offers a separate durable copy. Import is limited to 250 KB. Reset asks before replacing edited source.

## Teaching examples

Caesar, Vigenère, Atbash and rail fence demonstrate historical techniques without presenting them as secure modern encryption. The one-time-pad principle example uses fresh operating-system random bytes and explicitly states the theoretical requirements and lack of authentication. Fernet, AES-GCM and RSA-OAEP exercise real library encryption and error handling. SHA-256 is clearly labelled hashing, and the final starter shows `input()`, loops and `print()`.

All named methods and library details are marked as extra context alongside their OCR connections. The required symmetric/public-private key ideas remain identified as OCR 1.3.1(c); hashing connects to 1.3.1(d). No extra algorithm-recall requirement is implied. All keys are disposable examples; the page is not a secure key store.

The examples are original classroom scripts. API usage was checked against the primary documentation:

- [Pyodide quickstart](https://pyodide.org/en/0.29.3/usage/quickstart.html), [standard streams](https://pyodide.org/en/0.29.3/usage/streams.html) and [worker execution](https://pyodide.org/en/0.29.3/usage/webworker.html).
- [Fernet](https://cryptography.io/en/latest/fernet/), [authenticated encryption](https://cryptography.io/en/latest/hazmat/primitives/aead/), and [RSA/OAEP](https://cryptography.io/en/latest/hazmat/primitives/asymmetric/rsa/).

## Checks

`tests/python-workspace.cjs` uses a real browser and actual runtime/package downloads. It runs every example, checks expected classical outputs and modern rejection paths, stdin/EOF, syntax/runtime errors, fresh variables, draft persistence/reset, imported/downloaded source, indentation, Stop/restart, output limiting, search, mobile overflow and CDN-failure recovery. Set `PLAYGROUND_URL` to the deployed site root to run the same checks against GitHub Pages.
