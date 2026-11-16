# Computer science study resources

Original explanations and practice organised around the existing Craig 'n' Dave SLR groups. This area currently covers **SLRs 2, 3, 4, 9 and 11**, not the entire H446 course.

| SLR | OCR reference | Existing topics | Extended material |
| --- | --- | --- | --- |
| 2 | 1.1.2 | CISC/RISC; GPUs; multicore and parallel processing | 6 worked examples, 9 guided checks |
| 3 | 1.1.3 | Input/output; magnetic, optical and flash storage; RAM/ROM; virtual storage | 8 worked examples, 12 guided checks |
| 4 | 1.2.1 | OS purpose; memory; interrupts; scheduling; OS types; BIOS; drivers; VMs | 18 worked examples, 24 guided checks |
| 9 | 1.3.1(a-d) | Lossy/lossless; RLE and dictionaries; encryption; hashing | 10 worked examples, 12 guided checks |
| 11 | 1.3.3(a-e) | Network characteristics/standards; TCP/IP; DNS; packet/circuit switching; hardware; client-server/P2P; threats; firewalls/proxies/encryption | 16 worked examples, 24 guided checks |

Each topic includes a learning goal, defined terminology, fuller explanations of mechanisms and trade-offs, visible step-by-step worked examples, a prediction task linked to its lab, self-check questions with revealable explanations, common misconceptions and guidance on constructing an answer. Across the five units there are 27 topics, 29 labs, 58 worked examples, 81 guided checks and 48 quiz questions. The original activities, navigation and review-progress controls remain in place.

Worked examples state their assumptions. Classroom models are explicitly distinguished from real implementations: simplified ISA comparisons are not processor benchmarks; tightly packed colour quantisation is not JPEG; the extra dictionary example has its own stated format; page replacement uses a specified policy; scheduling examples ignore context-switch overhead where stated. The SLR 9 cryptography lab still uses browser cryptography, but the SHA-256 comparison is not presented as a password-storage recommendation.

## Sources and scope

Every topic includes an OCR focus note and a specification reference. `shared/scope.js` maps the existing material to that focus and marks supporting implementation detail as **Extra context** beside the relevant explanation, worked example, question or lab. **Related OCR content** identifies connections to another specification point rather than incorrectly calling them outside the course. The review quizzes use the same scope notes, including after revealing feedback. No material or interactive activity is removed.

For example, explaining symmetric/asymmetric keys is core 1.3.1(c), while AES-GCM/RSA-OAEP parameters, certificates, signatures and hybrid implementation details are labelled extra context. Password storage remains a required hashing use, while the chosen SHA-256 parameters and practical salting/slow-derivation details are labelled supporting context. The formal serial-fraction formula is labelled as an illustration of Amdahl's law rather than a formula prescribed by the multicore point. Teaching formats and numeric assumptions are distinguished from facts students should memorise.

Scope labels are editorial guidance based on the named content and OCR's subject-content clarification; they do not claim OCR has excluded a concept from every possible question. Broad requirements can be applied in unfamiliar scenarios. OCR's clarification for 1.3.1 explicitly expects understanding how symmetric/asymmetric encryption works and practical small examples of compression; this necessary explanation is not categorised as optional merely because the specification is concise. [OCR subject-content clarification (official indexed document)](https://www.ocr.org.uk/Images/383613-subject-content-clarification-guide.pdf) was consulted via its searchable text; its direct download returned 404 during this update, as did the older specification PDF endpoint. Use the working qualification page below to find current documents.

- [OCR H446 qualification and specification download](https://www.ocr.org.uk/qualifications/as-a-level-gce/computer-science-h046-h446-from-2015/) provides the curriculum scope. The previously used direct PDF endpoint returned 404 during this update, so footer links now use the official qualification page and its specification download link.
- Craig 'n' Dave topic groupings: [SLR 2](https://craigndave.org/video-categories/slr-2-types-of-processor/), [SLR 3](https://craigndave.org/video-categories/slr-3-input-output-and-storage/), [SLR 4](https://craigndave.org/video-categories/slr-4-operating-systems-systems-software/), [SLR 9](https://craigndave.org/video-categories/slr-9-compression-encryption-and-hashing/).
- [SLR 11 Networks](https://craigndave.org/video-categories/slr-11-networks/) and [OCR's networks delivery guide](https://www.ocr.org.uk/Images/231758-networks-delivery-guide.pdf) establish the new unit's grouping/scope. [RFC 1034](https://www.rfc-editor.org/info/rfc1034/) and [RFC 1122](https://www.rfc-editor.org/info/rfc1122/) support the DNS and protocol-layer explanations; protocol-specific details are labelled extra context.

Explanations, examples and practice answers are independently written. They are not OCR past-paper questions, official mark schemes, or endorsed Craig 'n' Dave materials. The worked-example steps are intended to model reasoning rather than predict a mark allocation.

## Implementation and verification

`shared/study-02.js`, `study-03.js`, `study-04.js` and `study-09.js` contain the extended content for their respective unit. Each page loads only its own unit's guide. `shared/study.js` inserts the reading and practice around existing activities without replacing lab DOM, event handlers or topic IDs. `shared/study.css` extends the established colour and type styles. Shortcut buttons scroll and move keyboard focus without changing the topic hash.

Run `tests/cs-study-content.cjs` for topic coverage and numerical examples checked against the existing executable models, and `tests/cs-study-browser.cjs` for all 19 rendered guides, answer reveals, jump-button focus, lab preservation and mobile layout. Existing `cs-units-models.cjs`, `slr9-models.cjs`, `cs-units.cjs` and `slr9.cjs` provide the original lab, quiz and navigation regression checks.

SLR 11 uses `slr-11/content.js` for its topic summaries and quiz, `study.js` for the full lessons, `models.js` for deterministic teaching models, and `labs.js` for local visualisations. Its `scope.js` contributes mappings through `window.CSExtraScopes`, avoiding changes to older topic mappings. Run `tests/slr11-models.cjs` and `tests/slr11-browser.cjs` for its eight activities, all failure/recovery cases, scope labels, quiz, navigation and mobile layout. No actual DNS lookup, packet transmission or firewall configuration is performed. The example domain and IP address are reserved for documentation. Packet routes, arrival orders, loss and circuit capacity are explicit teaching assumptions rather than measurements or a complete protocol implementation.
