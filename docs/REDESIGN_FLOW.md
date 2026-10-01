# Continuous visual narrative — 2.2.0

The previous homepage separated the yacht renders into white cards and repeatedly switched between boxed content sections. This release replaces that presentation with a full-width editorial sequence: an atmospheric STORM hero, a personal introduction, dissolving original interior photographs, workshop evidence, an alternating yacht collection, engineering, services and partnership information.

Soft image masks and continuous marine colour gradients integrate the supplied media into the page. No original image or video was edited or replaced. Specifications, source qualifications, business contacts and Maximus Kiriyakulov's author attribution remain intact. Model pages and the investor route use the same typography, spacing and image treatment.

Motion uses IntersectionObserver, passive scroll events and requestAnimationFrame, with no animation library, automatic video or scroll interception. Reduced-motion preferences take effect immediately. Content and ordinary links remain available without JavaScript; the original interior photographs also open in the accessible gallery.

## Validation

- Node 22: syntax checks, 61 tests, original-media SHA checks and production build passed.
- All 14 English/Russian routes: 320, 390, 768, 1024, 1440 and 1920 px; no horizontal overflow.
- Menu, alternate-language routes, local links, model specifications, gallery controls, focus restoration and workshop playback/pause checked in Chrome.
- Enquiry validation and copying checked without sending a real message. The existing mailto configuration remains in place.
- Scroll crossfade checked at 0%, 50% and 100%; reduced-motion and JavaScript-disabled fallbacks checked.

The repeatable browser checks are `scripts/flow-browser-qa.mjs` and `scripts/flow-motion-qa.mjs`. They use an optional external Playwright installation (`PLAYWRIGHT_MODULE`) and a running local server (`QA_ORIGIN`, default `http://localhost:3000`). Reports are stored alongside this document. Screenshots are local, ignored build artifacts under `artifacts/flow/`.
