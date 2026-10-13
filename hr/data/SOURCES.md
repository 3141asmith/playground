# Stellar atlas data

## Stellar Catalog import

Source index: https://www.stellarcatalog.com/allstars.php (11,126 distinct linked profile URLs in the retrieved index, whose headline lists 11,128 stars). Public individual profiles supply stellar component IDs, names, aliases, spectral types, temperatures, luminosities and radii. Each plotted named object links to its originating profile.

The 2026-10-13 import is PARTIAL: 160 profile pages retrieved before the source returned HTTP 429. The importer was stopped. The cached pages yielded 198 unique components, of which 185 have enough physical data to plot; 13 are omitted. All 131 ESO templates remain available, giving 316 plotted points. `import-report.json` records coverage, omissions and merges; `stellar-records.json` preserves the extracted source fields before derivations. No missing pages are represented by invented stars.

`hr/import-stellarcatalog.cjs` resumes using ignored `artifacts/stellar-cache/` and the downloaded index in `artifacts/stellarcatalog-all.html`. It now uses one worker, waits two seconds between uncached requests, and stops on HTTP 429. It must not be repeatedly retried against a rate limit. `--offline` rebuilds the snapshot from the existing cache without network requests. Download the index with curl or fetch and Node's system certificate store for a future authorized refresh. `node hr/build-catalogue.cjs` reproduces the combined browser data from the bundled snapshots, with no network access.

Deduplication uses exact catalogue component IDs and normalized canonical names (Unicode normalization, case and whitespace). Repeated appearances across system pages merge into one object. Different A/B/C components stay separate. Source aliases can refer to an entire system, so shared aliases alone do not collapse distinct components; aliases are searchable details, not additional plotted objects. A shared spectral type or equal physical properties is not evidence of a duplicate. ESO templates are reference spectra, not named stars, so a G2 V template and Sol are distinct entries.

Positive source T, L and R values are preserved. If exactly one of these is missing, the Stefan–Boltzmann relation derives it from the other two: L/Lsun = (R/Rsun)^2 (T/5772 K)^4. Derived values are labelled in the details. Catalogue radii use the precise solar-radius text where supplied, otherwise the displayed solar-radius percentage divided by 100. Source estimates, inconsistencies and rounding are inherited rather than silently corrected. Objects without any two positive finite values are omitted. White dwarfs use colour group D; L/T/Y cover brown-dwarf classes; unlisted spectral classes use a neutral '?' colour.

## ESO / Pickles reference templates

The 131 points represent composite spectral templates, not individual named stars.

- ESO list: https://www.eso.org/sci/facilities/paranal/decommissioned/isaac/tools/lib.html
- A. J. Pickles (1998), PASP 110, 863, Table 2 and section 5.2: https://www.eso.org/sci/facilities/paranal/decommissioned/isaac/tools/lib/hilib.pdf
- CDS catalogue J/PASP/110/863: https://cdsarc.cds.unistra.fr/viz-bin/ReadMe/J/PASP/110/863?format=html
- Original physical data: https://cdsarc.cds.unistra.fr/ftp/J/PASP/110/863/synphot.dat.gz
- Solar conventions: IAU 2015 B2 https://arxiv.org/abs/1510.06262 and B3 https://www.iau.org/common/Uploaded%20files/IAUGA2015-Resolution-B3-recommended-nominal-conversion.pdf

Retrieved 2026-10-13. `synphot.dat` is the unmodified decompressed CDS fixed-width table. `ReadMe` is its data dictionary. `eso-types.json` contains the distinct template identifiers extracted from the ESO page. Updated `_new` infrared spectra are versions of existing templates, not extra points. CDS uses `m2p5v`; ESO uses `m2.5v` for the same M2.5 V template.

Run `node hr/build-data.cjs` from the repository root to reproduce `stars.js`. This validates all 131 entries against the ESO list. No network requests are needed when viewing the diagram.

Temperature T = 10^LogTe kelvin; L/Lsun = 10^((4.74-Mbol)/2.5); R/Rsun = sqrt(L/Lsun) (5772/T)^2. The paper's bolometric magnitudes are indicative values, not precise measured properties of individual stars. Derived radii inherit this limitation. M9 III and M10 III templates are synthetic (see the CDS description).

The conventional H–R axes are logarithmic, with decreasing temperature to the right. Spectral colours are illustrative. The default compressed symbol radius is 3 + 5 log10(1+R/Rsun) SVG units, preserving size ordering while keeping dwarfs visible. Proportional mode uses symbol radius = 36 (R / largest template radius) SVG units, preserving true radius ratios with no minimum-size clamp. The size key uses the same function. Invisible hit targets are larger for pointer and keyboard accessibility and do not change visible sizes.
