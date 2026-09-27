# MAXIMUS.BOATS — commercial audit and release

Date: 27 September 2026. Release: 2.1.0.

## User objective and authorization

The owner requested an understandable, selling website that attracts investors, a full audit, immediate correction and publication. Exact current instruction: «Мне сайт нужен понятный продающий и привлекающий инвесторов … Сайт дизайн не обновлено до сих пор! Почему! Делай полный аудит. И определи что нужно исправить и изменить и сразу же это делай». This replaces the prior instruction to stop after a design Preview. No email sending is part of the acceptance outcome.

## Findings and corrections

| ID | Finding and evidence | Correction |
|---|---|---|
| B01 | Public site still served main `2a3cd00`, CSS `site.8f548691d6.css`, HTTP 200. Arc remained on a separate Preview branch. | Publish the reviewed redesign through the existing GitHub/Vercel production pipeline and verify served content. |
| B02 | First screen showed an unfinished hull and a generic slogan, without a direct buying proposition. | Clear custom-yacht proposition, original STORM design visual, brief service description and buyer/investor actions. |
| B03 | Three of four models were hidden behind tabs. | Four visible yacht cards with intended use, source dimensions, direct specifications and project discussion links. |
| B04 | Investors were sent to a separate club; the commercial shipyard project had no dedicated explanation or next step. | `/en/partnerships/` and `/ru/partnerships/`: shipyard concept, vessel portfolio, documented work, industrial/technology/capital discussion paths, project status and commercial contact. |
| B05 | Calls to action appeared late on project pages; next steps for a buyer were unclear. | Top-of-page model CTA and a three-step brief, scope and individual-proposal section. |
| B06 | Home sequence dispersed services, evidence and shipyard information. | Buyer choice first, shipyard partnership entry next, followed by VANUATU evidence, services, engineering, interiors, process, institutional club and contact. |
| B07 | Public robots.txt disallowed all crawling; HTML used noindex and lacked a canonical URL. | Production index/follow, canonical and EN/RU alternate links, unique descriptions, social metadata and 14-route sitemap. Preview remains noindex. |
| B08 | Previous release reporting emphasized form tests instead of a visible public result. | Acceptance focuses on deployed design, sales/investor paths, links, localization and production content. |

## Preserved requirements

All four source model records remain byte-identical. Thirteen source images and one source video remain unchanged and retain their provenance. No new generated or retouched vessel imagery. Existing engineering, build, refit, interiors, vessel-management content, MIPA contact, original public contacts and separate institutional MIBC (DIFC) role remain. Server/API, enquiry delivery mode, security headers and dependencies remain unchanged. Styles retain the Arc-derived navy, pale surfaces, Inter and silver palette while improving commercial hierarchy.

## Source and claim review

- `src/content/projects.json`, unchanged: exact dimensions, separate STORM overall/waterline lengths, HUNTER qualified speed/range, VANUATU design/refit status.
- `01-MAXIMUS-SHIPYARD-RAK-UAE.pdf`, supplied source, pages 1, 3 and 36 visually inspected: architectural project; production buildings for vessels up to 24 m and 25–50 m; energy concepts.
- `02-Group-of-Shipbuilding-Companies-Headed-by-MAXIMUS-VEGAS-LLC-2.pdf`, supplied source: service portfolio and project/archive evidence.
- `docs/content-source-map.json` and `docs/asset-manifest.json`: source-to-asset mapping and SHA-256.
- Partnership categories are proposed directions for discussion, not claims of signed counterparties or a live securities offer.

The available files do not establish current site rights, permits, CAPEX, project economics, a fundraising amount, promised returns or operating status. The page presents the architectural concept and requests documentary review for the next stage; it does not manufacture these facts. These missing commercial inputs remain a limitation to a transaction-ready investor case.

## Verification

Node 22.23.3: clean dependency install, syntax check, 61 existing tests, 14 unchanged media hashes, and a 14-page build passed. Static verification covered one h1 per route, unique IDs, all local images, 56 internal routes/anchors, language counterparts, production indexing, canonical/social metadata and the sitemap. A separate Preview build remained noindex even with PUBLIC_INDEXABLE=true. See `commercial-qa.json`.

Authenticated deployed Chromium checked all 14 routes at 1363 × 936, one h1, correct language counterparts, four visible yacht cards, no horizontal overflow, partner/model CTAs, full-size shipyard gallery and Escape. No application console errors were recorded. The final production commit/deployment is recorded in the merged pull request and Vercel deployment. The earlier Arc reports are historical; their mobile/width results do not certify the new layout. Physical mobile devices are not tested.

## Rollback

Original production source: `2a3cd006e0d8a4363fe6f3466d63b025055c4cf1`. Original production deployment: `J8vo8675eYzcaU55mLaA5t3ZKN5z`. Pre-audit Preview branch: `89c550f75ab03f2700501153a7abe26f008bd25a`. Retain these as source and deployment recovery points.
