# MAXIMUS BOATS — Arc redesign record

Status: GITHUB SAVED; VERCEL PREVIEW VERIFIED; AWAITING DESIGN APPROVAL BEFORE PRODUCTION · Version: 2.1.0-preview-review-3 · Date: 27 September 2026 (Dubai)

## Baseline and rollback

- Repository: https://github.com/MAXIMUS-NPiO/maximus-boats
- Main commit: `2a3cd006e0d8a4363fe6f3466d63b025055c4cf1`
- Main tree: `f8880aa49c7d89921748d2eadded3cc30147df61`
- Working branch: `redesign/arc`, in a separate clean clone. No existing working directory or uncommitted work was overwritten.
- GitHub reports a successful Vercel deployment for this commit: https://vercel.com/maximus-fdc6/maximus-boats/J8vo8675eYzcaU55mLaA5t3ZKN5z
- Public `/en/` returned HTTP 200 and exactly matched the initial main build (45,763 bytes), including CSS `site.8f548691d6.css`.
- Public GET `/api/contact` returned `{"mode":"mailto","siteKey":null}`. No public POST was made.
- Vercel API initially returned scope access 403. After the owner signed in, the Vercel dashboard confirmed the current production deployment, main commit and domain assignment above. This historical API limitation no longer blocks browser verification.
- Initial branch creation through the connector returned GitHub 403 and Git transport exited 128. After owner-approved browser fallback and successful GitHub sign-in, `redesign/arc` was created and the complete runtime code was uploaded. Runtime source commit: `ac05da295674c2e38dbae7f1188245760ebe34b0`; files outside docs match the locally tested `957311f1874deb9e346acf56a0d9f23ef676c5aa`.
- Existing Vercel Git integration first created https://maximus-boats-11fudx7pl-maximus-fdc6.vercel.app (`3rNKpxkpksNd34Wk58TSR6P64bj9`, GitHub deployment `6686505412`). After the documentation commit, deployment `FAFUgcpuYUoxpXMq7c5bnGnmmbLf` for commit `46bab8118bbbbfcc67b2e9f3372867460b60da45` was confirmed Ready and tested at https://maximus-boats-ghm8gk1uq-maximus-fdc6.vercel.app . Vercel Authentication remains enabled.
- All 12 deployed routes were checked in authenticated cloud Chromium at 1363 × 936. Same-project language links, model tabs, menu, gallery, video playback and form copy/validation passed without sending mail. See `arc-deployed-browser-qa.json`. The branch preview addresses were also opened: https://maximus-boats-git-redesign-arc-maximus-fdc6.vercel.app/en/ and https://maximus-boats-git-redesign-arc-maximus-fdc6.vercel.app/ru/ .
- Rollback source remains the main commit above; the production deployment is now confirmed in the authenticated dashboard. A production promotion is outside this preview release and awaits the owner's design approval.

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
| A02 | Record original commit/deployment; preserve local work | Baseline and rollback section; authenticated Vercel dashboard | Complete; current production confirmed |
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
| A14 | Commit/push and Vercel Preview in existing project | GitHub branch, source commit and successful Preview deployment | Complete; remote browser QA passed after sign-in |
| A15 | Updated release checklist, screenshots, exact readiness | RELEASE_CHECKLIST.md and QA artifacts | Complete; see release checklist |

## MIPA

This record preserves internal source provenance and release evidence. No MIPA registry write or registration identifier is asserted. Existing institutional roles and IP wording remain authoritative.

## Final local outcome

Node 22 checks pass. Local Chromium verified 12 routes at six widths, 46 internal links, project data, language routes, menus, image galleries, source video, and form copy/validation. No page or application console errors. All 37 protected files match the baseline. Authenticated remote Chromium additionally verified the 12 deployed routes and the interactions recorded in `arc-deployed-browser-qa.json`; real email was not sent. The current production deployment https://maximus-boats-mbnejiny9-maximus-fdc6.vercel.app is confirmed. The redesigned runtime is saved in GitHub, a Ready Vercel Preview has been verified, and design approval is the remaining publication gate. Physical Safari/iOS/Android devices were not tested. No production release is claimed.
