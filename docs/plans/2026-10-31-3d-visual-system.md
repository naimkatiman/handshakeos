# HandshakeOS 3D visual system

Goal: give the existing website a recognizable, coherent family of dimensional icons, larger illustrations, and favicons without changing product behavior.

Initial base: origin/main at a6d65c1e2bc943589c8e60ad82720e3d1d9ca37d. Rebased onto d57eb7e (the published tutorial) before final verification. Isolated branch: feat/3d-visual-system-20261031. Other sessions own the release checkout and copy changes.

## Approved execution assumptions

The user's request authorizes local visual implementation. Self-approved for local work because the deliverable is the requested visual upgrade, existing flows remain intact, and there are no dependencies or deployment changes. Preserve navy, mint, ivory, and amber. Use dimensional SVG artwork to keep the existing vector identity sharp on mobile. Retain all original copy and the existing hero video and WebGL scene. No publishing in this task.

## Ambition brief, light tier

- Asked: create 3D icons, assets, favicon, and populate the website.
- Outcome: recognizable visual cues connect the landing page, capture, evidence review, and outcomes.
- Higher outcome: make the evidence workflow easier to understand. This cannot be claimed without user testing; execute the concrete visual layer.
- Brand design activity: develop a shared material, light direction, bevel, and silhouette; output reusable source SVGs.
- Product design activity: map symbols to actual functions and use generous art only at section boundaries; output integrated page placements.
- Accessibility and performance activity: test small-screen layout, decorative semantics, reduced motion, transfer budget, and existing controls; output a runnable browser check.
- Raw material: current route components, HeroNetwork, brand variables, English and Malay copy, and rendered browser views.
- Existence proof: the existing hero uses Three.js cards in navy and mint. Carry that material language across the product without adding more WebGL contexts.
- Belief to challenge: putting 3D art everywhere improves usability. Keep small navigation cues and data rows clear, and test the narrow viewport before accepting the result.

## Plan

1. Record the baseline with a browser check before implementation.
2. Create an original dimensional asset family, a large proof illustration, and a small-size favicon from the same brand mark.
3. Add a typed asset component and shared CSS. Populate the two landing languages, navigation, capture examples, dashboard stages, and evidence workflow.
4. Run typecheck, production build, and browser checks. Inspect desktop and mobile screenshots and fix concrete failures.

## Acceptance and guardrails

- At least eight original reusable illustrations, each under 20 KB; all SVG assets combined under 100 KB.
- Matching favicon visible at 16, 32, and 48 pixels; touch icon at 180 pixels.
- Visuals on /, /ms, /capture, /dashboard, and /opportunity/[id].
- No extra rendering library, image library, or animation dependency.
- No missing image requests, browser errors, or horizontal overflow at 320, 390, and 1440 pixels.
- Decorative icons use empty alt text and never replace a control's accessible name.
- Reduced-motion preference disables newly added transforms and motion.
- Existing sample analysis, evidence confirmation, hearsay rejection, and navigation still work.
- Do not touch lib/samples.ts, lib/seed.ts, API routes, release scripts, credentials, or the other sessions' worktrees.

## Verification

Run npm run typecheck and npm run build -- --webpack. The isolated worktree reuses the existing node_modules through a local junction; Webpack resolves that junction without changing project configuration. Run scripts/verify-visuals.mjs against the local production server. Set PLAYWRIGHT_MODULE to an existing Playwright module and CHROMIUM_PATH to an existing browser if they are not on the normal module/browser paths. HANDSHAKE_TEST_ORIGIN defaults to http://localhost:3142. HANDSHAKE_VISUAL_OUTPUT selects a screenshot directory (default: the system temporary directory plus handshakeos-3d-verification). No Playwright dependency is added to the application.

Asset files are regenerated with node scripts/generate-visual-assets.mjs. Regeneration was checked for byte-identical output. Asset and UI commits are separate; no commit exceeds 15 files or 500 non-generated lines.

## Status

Verified 2026-10-31. Baseline: four routes at 320, 390, and 1440 pixels had zero new visual placements. Final: all 18 route/viewport checks pass across /, /ms, /capture, /dashboard, /versions, and a real /opportunity/[id]. No horizontal overflow, overlapping phone hero art, missing images, or browser runtime errors. Nine original SVG assets total 32,888 bytes against the 100 KB target. The largest asset is 8,368 bytes against the 20 KB target.

Typecheck and the production Webpack build pass. The browser run uses the local production build. It verifies accessible home links, favicon metadata, normal hover and reduced-motion behavior, sample analysis, evidence confirmation, and hearsay rejection. The ICO directory and embedded PNGs were separately checked at 16, 32, and 48 pixels; the touch icon is 180 pixels. Screenshots were visually inspected on desktop and phone. HTTP 304 is accepted as a successful cached asset response.

Local preview: http://localhost:3142. Screenshot directory: the system temporary directory plus handshakeos-3d-verification. No push, merge, or deployment was performed.

The judge caught a five-pixel navigation overflow after the larger brand mark. The final navigation keeps all three links and exposes the model status to assistive technology at narrow widths. The phone hero uses separate grid rows for copy and artwork, so neither covers the other. The checker waits for SVG decoding after hydration before judging image loading. Dead styling for the replaced text-only brand tile was removed.

Scope includes the current /versions page and the newly published tutorial. No changes to source copy, API behavior, storage, release scripts, package dependencies, or production deployment.

The next outcome to measure is whether first-time users recognize the capture-to-evidence-to-outcome flow more readily. That requires user observation; no conversion or usability improvement is claimed from screenshots alone.

## Production release, 2026-10-31

The user subsequently authorized: "go push and deploy". Release from release/3d-visuals-20261031 through a GitHub pull request. Preserve the already-live v22-v25 commits (deal questions, CSP, branded 404, and keyboard access), which were missing from origin/main. Those committed changes were replayed before the three visual commits in an isolated worktree. Uncommitted changes in the other sessions remain excluded. The production baseline at preflight is Worker version 683fae61-ec6c-4203-ab5a-e5da1c5fae59 (100% traffic), with v25 and CSP verified publicly.

Release gates: typecheck and production browser suite on the combined source; approved PR head checked immediately before merge; clean worktree at the exact merged SHA; OpenNext build; deployment with existing variables and secrets preserved; public asset hashes, favicon, CSP, keyboard access, and the sample evidence flow verified after deployment. No migrations are owned by this release.

## Asset expansion, 2026-10-31

Request: "go populate more assets". Execute locally in feat/3d-assets-expansion-20261031 from origin/main bd164aed0d1ebb0266fea85985c8f7f414fdcf27. The earlier deployment handoff is still pending; this request authorizes further visual work, not interference with the parallel deployer.

Self-approved implementation plan: extend the existing material palette and generator with eight functional icons (mail, checklist, calendar, search, archive, alert, compass, receipt) and one larger briefing illustration. Use them in the capture entry points, follow-up and action cards, deadline reminders, evidence and risk sections, saved records, landing explanation, and the existing 404. Preserve copy, data, controls, print behavior, and existing layout hierarchy. No new dependencies or runtime animation.

Baseline: nine reusable SVG assets. Expansion target: eighteen assets total, all below 20 KB individually and the collection below 100 KB. Every new asset must be used in the application. Small controls keep visible text; artwork is decorative and cannot imply that unverified evidence is confirmed.

Verification: regenerate the artwork and inspect a contact sheet; run typecheck and the production Webpack build; extend the existing browser check for the additional placements and 404; exercise capture, evidence confirmation, hearsay rejection, own-deal filtering, and print presentation. Inspect desktop and 320/390 pixel screenshots. Keep asset and UI commits separate, each below the repository's file and line limits.

Expansion verified: eighteen assets total 67,664 bytes; the largest is 8,385 bytes. All nine added assets were observed in the browser. Typecheck, production Webpack build, all 21 route/viewport checks, favicon and reduced-motion checks, sample capture, confirmation, hearsay rejection, printable follow-up, and own-deal filtering pass. The browser run uses the existing recorded samples with model credentials unset in the local server process. Desktop and phone screenshots and the artwork contact sheet were inspected. Local production preview: http://localhost:3145. Deployment still awaits the previously requested cross-session handoff.

## Consolidated release authorization

The user now requests: "go commit, merge all and deploy". Consolidate the completed KitaKantin pitch PR #5, the committed v28-v30 app improvements, and the 18-asset family. The pending seed-data extraction is included only after proving all 19 records are identical to the original inline dataset. The original checkout's npm peer-metadata-only changes and the newly started Blender work are outside this product release.

Use an isolated integration checkout, retain every existing visual and print rule when resolving overlaps, and update the walkthrough check to the newly approved Naim/KitaKantin copy. Verify desktop and mobile layouts, the evidence flow, returning-visitor next actions, print behavior, CSP, and exact deployed artifact hashes. Merge through GitHub, then build from the exact merged commit. Preserve all production variables and secrets. No migrations or new dependencies are required.

The completed v31 ecosystem print report was also preserved. The combined production build and all 21 viewport checks pass, including unobscured 320/390px hero copy and the audit explanation below its heading. The Naim evidence walkthrough, printable deal follow-up, ecosystem report, personal-deal filtering, and returning-visitor next-action links pass. CSP, keyboard skip/focus, branded 404, API validation, and all 18 asset hashes were checked against the local production server. Latest observed live baseline before packaging: Worker 5d024335-5fdc-406c-86b0-15cda2d92ca4.
