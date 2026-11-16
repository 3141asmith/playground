# Computer science study resources

Original explanations and practice organised around the existing Craig 'n' Dave SLR groups. This area currently covers **SLRs 2, 3, 4 and 9**, not the entire H446 course.

| SLR | OCR reference | Existing topics | Extended material |
| --- | --- | --- | --- |
| 2 | 1.1.2 | CISC/RISC; GPUs; multicore and parallel processing | 6 worked examples, 9 guided checks |
| 3 | 1.1.3 | Input/output; magnetic, optical and flash storage; RAM/ROM; virtual storage | 8 worked examples, 12 guided checks |
| 4 | 1.2.1 | OS purpose; memory; interrupts; scheduling; OS types; BIOS; drivers; VMs | 18 worked examples, 24 guided checks |
| 9 | 1.3.1(a-d) | Lossy/lossless; RLE and dictionaries; encryption; hashing | 10 worked examples, 12 guided checks |

Each topic includes a learning goal, defined terminology, fuller explanations of mechanisms and trade-offs, visible step-by-step worked examples, a prediction task linked to its existing lab, self-check questions with revealable explanations, common misconceptions and guidance on constructing an answer. The original 21 labs, 32 quiz questions, navigation and review-progress controls remain in place.

Worked examples state their assumptions. Classroom models are explicitly distinguished from real implementations: simplified ISA comparisons are not processor benchmarks; tightly packed colour quantisation is not JPEG; the extra dictionary example has its own stated format; page replacement uses a specified policy; scheduling examples ignore context-switch overhead where stated. The SLR 9 cryptography lab still uses browser cryptography, but the SHA-256 comparison is not presented as a password-storage recommendation.

## Sources and scope

- [OCR H446 qualification and specification download](https://www.ocr.org.uk/qualifications/as-a-level-gce/computer-science-h046-h446-from-2015/) provides the curriculum scope. The previously used direct PDF endpoint returned 404 during this update, so footer links now use the official qualification page and its specification download link.
- Craig 'n' Dave topic groupings: [SLR 2](https://craigndave.org/video-categories/slr-2-types-of-processor/), [SLR 3](https://craigndave.org/video-categories/slr-3-input-output-and-storage/), [SLR 4](https://craigndave.org/video-categories/slr-4-operating-systems-systems-software/), [SLR 9](https://craigndave.org/video-categories/slr-9-compression-encryption-and-hashing/).

Explanations, examples and practice answers are independently written. They are not OCR past-paper questions, official mark schemes, or endorsed Craig 'n' Dave materials. The worked-example steps are intended to model reasoning rather than predict a mark allocation.

## Implementation and verification

`shared/study-02.js`, `study-03.js`, `study-04.js` and `study-09.js` contain the extended content for their respective unit. Each page loads only its own unit's guide. `shared/study.js` inserts the reading and practice around existing activities without replacing lab DOM, event handlers or topic IDs. `shared/study.css` extends the established colour and type styles. Shortcut buttons scroll and move keyboard focus without changing the topic hash.

Run `tests/cs-study-content.cjs` for topic coverage and numerical examples checked against the existing executable models, and `tests/cs-study-browser.cjs` for all 19 rendered guides, answer reveals, jump-button focus, lab preservation and mobile layout. Existing `cs-units-models.cjs`, `slr9-models.cjs`, `cs-units.cjs` and `slr9.cjs` provide the original lab, quiz and navigation regression checks.
