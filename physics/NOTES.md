# Teaching notes integration

`notes.js` adapts the supplied **A_Level_Physics_Notes.docx**, whose lesson sheets credit **N. Dwyer**. It adds expanded explanations, one further stepped calculation and one explanation question with a model answer to each of 32 existing core lessons. The 78 historical chapters are mapped to current lesson URLs in `PhysicsNotesChapters`, exposed through the searchable Physics hub index. The original source document, extraction output, embedded images and local school path are not distributed.

The original sequence is AS units 1–2 and A2 units 4–5. It is not the current AQA 7408 section numbering. Content is grouped into the existing current-topic lessons, retaining the core-only scope. Measurements/error lessons and required practical guides remain available alongside this material. This is a rewritten learning adaptation, not a verbatim transcription or a claim that the old notes constitute the current specification.

Review corrections include:

- Distinguish beta-minus from beta-plus; include the correct neutrinos and the positron in antineutrino–proton interactions. A free proton cannot spontaneously beta-plus decay.
- Define particle families by interactions and constituents rather than mass. Clarify neutral-pion composition and antiparticle quantum numbers. Avoid literal energy-borrowing explanations for virtual particles.
- Define potential difference and emf as energy per charge, not force. Correct sensor descriptions and avoid obsolete superconducting-record claims.
- Keep equilibrium compatible with constant velocity; distinguish a couple from coincident opposite forces. Separate stiffness, strength, proportionality, elasticity and fracture stress.
- Define coherence without requiring equal amplitudes. Increasing illuminated slit count at fixed spacing sharpens maxima without changing their principal angular positions. Use angles from the normal and the correct core/cladding index relationship.
- Use signed negative potential gradients, charged-particle acceleration qE/m, correct vertical-spring energy accounting and relativistic momentum where necessary.
- Distinguish closest-approach bounds from measured nuclear radii, mean binding energy per nucleon from separation energy, and sustained fission shutdown from continuing decay heat.
- Use absolute temperature and mean-square molecular speeds; avoid claims of zero quantum motion at absolute zero or identical collision frequencies at constant gas pressure.

All added calculations are newly written examples using stated rounded constants. Existing scored practice remains 92 questions; the 32 new explanation checks are unscored self-assessment, shown separately. No document macros, embedded links or document instructions are executed.

With the local preview server running, use the workspace Node to run `tests/physics-models.cjs`, `tests/physics.cjs` and `tests/physics-notes.cjs`. Browser checks use workspace Playwright and Edge; set `PLAYGROUND_URL` to verify a deployed site. The notes check validates all chapter targets and all 32 expanded lessons, reveals answers, and checks mobile layouts with notes open.
