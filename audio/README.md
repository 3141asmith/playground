# Audio Lab

Static, real-codec comparisons of one 16-second stereo piano recording. All 44 variants are bundled (about 17.25 MB total). Only the source and selected version are initially fetched; a six-entry decode cache bounds memory use. There is no runtime encoder, microphone permission, upload or server API.

## Source and rights

**Emotional Piano** by **triangelx**, recorded 23 May 2013, released under **CC0 1.0**.

- Original creator page: https://freesound.org/people/triangelx/sounds/189175/
- Source record and licence: https://commons.wikimedia.org/wiki/File:Emotional_piano.wav
- Original WAV: https://upload.wikimedia.org/wikipedia/commons/7/70/Emotional_piano.wav
- CC0: https://creativecommons.org/publicdomain/zero/1.0/
- Original SHA-1: `e8c449fba4fe1eb5e67e0923b6b696f2105584c5`
- 2,822,444 bytes; 44,100 Hz; stereo; signed 16-bit PCM; exactly 16 seconds.

The WAV and derived comparison files can be redistributed under the source's CC0 dedication. Creator credit and licence links are retained on the page.

## Encodings

All versions originate from that WAV, never from another lossy file. Three sample rates are available: 44,100, 22,050 and 11,025 Hz. Lower-rate masters are low-pass resampled into 16-bit stereo PCM with FFmpeg's `aresample`, filter size 64 and cutoff 0.95.

- WAV: 16-bit PCM, fixed bitrate determined by rate × 16 × 2.
- FLAC: compression effort 0, 5 or 8 at each rate. The settings affect storage and encoder work, not decoded samples.
- MP3: real libmp3lame encoding, with six targets (32–320 kbps) at 44.1 kHz, five (16–128 kbps) at 22.05 kHz and five (8–64 kbps) at 11.025 kHz.
- AAC: real AAC-LC in M4A, with six targets (32–256 kbps) at 44.1 kHz and five at each lower rate (16–128 and 16–64 kbps respectively).

`catalogue.json` records exact bytes, settings, source provenance and decoded PCM SHA-256 hashes. Every WAV/FLAC was decoded to PCM and checked against the master at its rate during generation. Only 44.1 kHz matches the original. Lowering the rate loses information before lossless encoding. Codec targets are distinguished from actual whole-file average bitrates, which include headers.

To reproduce, obtain the original source at `audio/data/source.wav`, verify its hash, then run `node audio/build-audio.cjs /absolute/path/to/ffmpeg`. A matching `ffprobe` must be alongside FFmpeg. The recorded encoder version is in the catalogue. The generator verifies headers, sample rates and lossless PCM equality before writing the manifest. FFmpeg itself is not distributed with the site.

## Playback and plots

Web Audio decodes each variant at its own native sample rate using an OfflineAudioContext. A user gesture starts the output AudioContext. A/B switches preserve playback position and use an 8 ms transition; volume is shared, without individual loudness normalisation. Playback speed and pitch are unchanged. Output hardware may resample to its supported rate. Playback uses a common 16-second timeline, trimming any trailing lossy-codec padding.

The overview uses left-channel min/max envelopes. The close-up plots decoded samples with a shared amplitude scale, and shows dots where sparse enough. The spectrum uses a Hann-windowed radix-2 FFT, with equal-duration windows across the three sample rates and amplitude normalisation to dBFS. Plots update at about 10 Hz during playback. Near the start/end, the spectral window is zero padded. The dashed ceiling is the sample-rate Nyquist limit, not a guarantee that a lossy codec retains frequencies up to it. Graphs and listening impressions do not replace the bytewise equality check. There can be decoder-specific timing differences for lossy formats.

## Verification

- `tests/audio-models.cjs`: all 44 files/sizes/identities, source hash, PCM formula, lossy-vs-lossless classification including reduced-rate FLAC, option compatibility and a known-amplitude sine FFT.
- `tests/audio.cjs`: real decode/playback, same-position A/B, seek/pause/restart, every encoding option, independent browser FLAC/WAV sample equality, download, lower-rate labels, mobile plots, decode-failure recovery and no POST requests.

Browser checks use workspace Playwright and Edge. Serve Playground locally or set `PLAYGROUND_URL` to test a deployment. Audio output is exercised through the browser; the checks do not claim a physical speaker or headphone listening test.
