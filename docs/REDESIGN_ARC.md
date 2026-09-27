# MAXIMUS BOATS — Arc redesign record

Status: GITHUB SAVED; VERCEL PREVIEW READY; REMOTE BROWSER REVIEW REQUIRES AUTHENTICATION · Version: 2.1.0-preview · Date: 27 September 2026 (Dubai)

## Baseline and rollback

- Repository: https://github.com/MAXIMUS-NPiO/maximus-boats
- Main commit: `2a3cd006e0d8a4363fe6f3466d63b025055c4cf1`
- Main tree: `f8880aa49c7d89921748d2eadded3cc30147df61`
- Working branch: `redesign/arc`, in a separate clean clone. No existing working directory or uncommitted work was overwritten.
- GitHub reports a successful Vercel deployment for this commit: https://vercel.com/maximus-fdc6/maximus-boats/J8vo8675eYzcaU55mLaA5t3ZKN5z
- Public `/en/` returned HTTP 200 and exactly matched the initial main build (45,763 bytes), including CSS `site.8f548691d6.css`.
- Public GET `/api/contact` returned `{"mode":"mailto","siteKey":null}`. No public POST was made.
- Vercel project inspection is blocked by scope access (403, `maximus-fdc6`). The deployment reference above is evidence from GitHub status, not a verified current Vercel alias assignment.
- Initial branch creation through the connector returned GitHub 403 and Git transport exited 128. After owner-approved browser fallback and successful GitHub sign-in, `redesign/arc` was created and the complete runtime code was uploaded. Runtime source commit: `ac05da295674c2e38dbae7f1188245760ebe34b0`; files outside docs match the locally tested `957311f1874deb9e346acf56a0d9f23ef676c5aa`.
- Existing Vercel Git integration created a successful Preview deployment: https://maximus-boats-11fudx7pl-maximus-fdc6.vercel.app (`3rNKpxkpksNd34Wk58TSR6P64bj9`, GitHub deployment `6686505412`). Opening it redirects to Vercel Authentication; remote browser validation awaits sign-in. No protection settings were changed.
- Rollback source remains the main commit above. A production promotion is outside this preview release. Exact Vercel alias rollback must be confirmed after project access is restored.

## Design source and interpretation

Reference and DESIGN.md: https://styles.refero.design/style/acfb6fa1-3aed-4e64-8522-7f332a796de8

Use light sans-serif display type, generous margins, marine navy and graphite, alternating pale technical sections, fine rules and minimally outlined controls. Photographs and drawings keep their original appearance. Silver remains the MAXIMUS accent. The reference informs hierarchy and spacing; no Arc identity, vessels, product claims or media are copied. Locally hosted Inter supplies Latin and Cyrillic at the same weights. The original MAXIMUS project imagery includes renders and archive photography; their labels override the reference's preference for photography alone.

## Source register

| Source | Purpose | Read/verified |
|---|---|---|
| User request, seven numbered clauses | Scope and acceptance requirements | All clauses recorded below |
| Current main, README.md, docs/ARCHITECTURE.md | Stack, routes, build and form boundaries | Read |
| docs/RELEASE_CHECKLIST.md, docs/QA.md | Existing factual limitations, roles and QA scope | Read |
| src/content/projects.json, site.js | Specifications, statuses and public contact details | Preserved baseline |
| docs/asset-manifest.json, src/content/media.json | Provenance and original assets | 14 media hashes verified |
| Refero Arc page and visible DESIGN.md | Visual direction | Read and reference screenshot inspected |

## Requirement coverage

| ID | Required outcome | Output / evidence | Status |
|---|---|---|---|
| A01 | Current main, instructions, isolated redesign/arc | Baseline above; clean clone; no AGENTS.md in checkout/ancestors | Complete locally |
| A02 | Record original commit/deployment; preserve local work | Baseline and rollback section | Vercel alias confirmation blocked |
| A03 | Arc composition, typography and light/dark rhythm, silver accent | src/styles/, shared components | Complete locally |
| A04 | All four projects and all EN/RU routes | Shared collection/project renderer and 12 routes | 12 routes verified |
| A05 | Engineering, build, refit, interiors, management, shipyard | Existing content components | Preserved; audit PASS |
| A06 | Separate MIBC/DIFC entry, commercial contacts, MIPA | club.html, contact.html, footer.html | Preserved; audit PASS |
| A07 | Exact specs, project statuses, media labels | projects.json and asset-manifest.json | Preserved; audit PASS |
| A08 | Existing media only, no generated or retouched images | public/media SHA-256 verification | Preserved; audit PASS |
| A09 | HTML/CSS/ES modules, Node 22 | package.json, .nvmrc, source structure | Preserved; audit PASS |
| A10 | API, security and current sending mode | api/, server/, shared/, vercel.json, enquiry.js | Preserve byte for byte |
| A11 | npm ci and npm run check:all | Node 22.23.3; initial 61 tests pass | Final run PASS, 61 tests |
| A12 | Desktop/mobile browser QA, routes, language, menu, gallery/video/form | Browser report and screenshots | Complete; see release checklist |
| A13 | No real email in tests | Mailto/copy validation; mocked server tests | No real email; test traffic constrained |
| A14 | Commit/push and Vercel Preview in existing project | GitHub branch, source commit and successful Preview deployment | Complete; remote browser QA awaits Vercel sign-in |
| A15 | Updated release checklist, screenshots, exact readiness | RELEASE_CHECKLIST.md and QA artifacts | Complete; see release checklist |

## MIPA

This record preserves internal source provenance and release evidence. No MIPA registry write or registration identifier is asserted. Existing institutional roles and IP wording remain authoritative.

## Final local outcome

Node 22 checks pass. Chromium verified 12 routes at six widths, 46 internal links, project data, language routes, menus, image galleries, source video, and form copy/validation. No page or console errors. All 37 protected files match the baseline. The recorded production deployment is https://maximus-boats-mbnejiny9-maximus-fdc6.vercel.app. The redesigned runtime is saved in GitHub and a successful Vercel Preview exists. See RELEASE_CHECKLIST.md for the authentication limit on remote browser QA and exact readiness; no public release is claimed.
