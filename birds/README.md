# Birdsong

Static, browser-local audio spectrogram and real BirdNET identification workspace. Open through the Playground server or GitHub Pages (not file://). No backend or API key. Audio is not uploaded. Models and libraries download from public hosts; these requests expose ordinary network metadata, but contain no recording data.

## Implementation

- Web Audio decodes supported recordings to 48 kHz, averages channels, and supplies overlapping three-second windows (1.5-second hop) to BirdNET. The final window is zero-padded if needed. Up to 60 seconds per analysis; 50 MB / 10 minute file limit. Long files can be explored and analysed in separate passages.
- The independent display FFT uses 2,048 samples with a Hann window. Display values are amplitude dBFS, bounded to −90…0 for colour mapping, with linear frequency up to 12 kHz. Each display column samples one frame; the full-file view is an overview, not an exhaustive event detector. Zoom for detail. Neither the display FFT nor the test sound is used as a substitute for the recognition model.
- The official BirdNET Live TensorFlow.js model and English UK labels are pinned to commit `6ab67ac09fa64d98858b90f14318229aca9bb7dc` of https://github.com/birdnet-team/real-time-pwa. Weights are about 51.3 MB (decimal); model JSON ~0.9 MB. TensorFlow.js 4.14.0 loads from jsDelivr. Browser caching depends on the browser and upstream headers.
- `model-worker.js` adapts the official custom mel layer and WebGL STFT kernel. The orchestration uses a dedicated worker, one inference window at a time, progress, cancellation and timeouts. Stop terminates the worker; the next analysis recreates it. Requires worker WebGL / OffscreenCanvas support (current Chrome/Edge recommended). No server fallback or image-only recognition.
- Up to five acoustic classes per window are retained. Results group by scientific name and rank by maximum window score. The slider filters those retained candidates; CSV includes all retained candidates, even below the visible threshold. Scores are model outputs, not calibrated correctness probabilities. Classes include some non-bird sounds. No location, date or geographic prior is applied; suggestions can be locally implausible.
- The synthetic whistle/trill is generated locally for teaching spectrogram reading. It is explicitly not a real bird or an identification benchmark.

## Attribution and licences

Source: [BirdNET Live](https://github.com/birdnet-team/real-time-pwa), MIT (see `BirdNET-LICENSE.txt`), with changes noted in `model-worker.js`. Its README declares its models CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/. We use unchanged model assets via immutable upstream URLs; no model weights are redistributed in this repository. TensorFlow.js is Apache-2.0.

BirdNET: Stefan Kahl, Connor M. Wood, Maximilian Eibl and Holger Klinck (2021), *BirdNET: A deep learning solution for avian diversity monitoring*, Ecological Informatics 61, 101236. https://doi.org/10.1016/j.ecoinf.2021.101236
