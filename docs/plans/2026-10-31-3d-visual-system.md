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
