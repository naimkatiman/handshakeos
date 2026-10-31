# Blender hero animation implementation plan

Goal: Create an original Blender animation in the existing landing hero.

Approved scope: On 2026-10-31 the user approved a new scene, a short muted hero loop, the existing navy and mint palette, and a reduced-motion still. Preserve landing copy and calls to action. Deliver local work for review; publication is outside this request.

Approach: Render a six-second, 24 fps scene of conversation cards linked to a verified-deal card. Use the existing Blender 4.5.14 installation and FFmpeg. Export an optimized MP4 and WebP poster, keep the editable blend source and generation script, and use native HTML video. No new dependencies.

Self-approved implementation details: Work in the native isolated worktree from origin/main cff6cb7. Replace the overlapping photographic background, WebGL card field, and static proof illustration with one Blender visual. Preserve the existing two-row phone composition. Pause when offscreen, hidden, or explicitly paused; reduced-motion and data-saving visitors receive the still without downloading video. The optional motion control is translated for both landing languages.

Files:
- scripts/render-handshake-hero.py: reproducible scene, keyframes, poster and video render.
- assets/blender/handshake-hero.blend: editable scene.
- public/landing/handshake-hero.mp4 and handshake-hero.webp: web assets.
- app/(marketing)/HeroAnimation.tsx: playback, fallback, and pause control.
- app/(marketing)/Landing.tsx, landing.css, copy.ts: integrate scene and translated control labels.
- components/visuals.css: preserve responsive placement for the new media wrapper.
- app/(marketing)/HeroNetwork.tsx: remove the superseded, unreferenced renderer.
- scripts/verify-hero-animation.mjs: browser regression checks.

Verification:
- Baseline: typecheck passes before edits. New browser check must fail because the Blender hero is absent.
- Render: inspect a full-resolution poster before rendering the sequence; verify six-second H.264 video, dimensions, no audio, seamless first/last pose, MP4 under 3 MB, WebP under 150 KB.
- Normal playback: both / and /ms play muted inline, pause offscreen and when requested, and resume appropriately. No WebGL initialization.
- Fallbacks: reduced motion makes no MP4 request; failed media leaves a visible poster; no JavaScript still shows the poster and the landing links.
- Layout: 320, 390, 768, and 1440 px widths have no overflow or overlap between art, copy and controls. Main CTA retains its existing target.
- Final: typecheck, production build, browser console, and diff checks.

Tasks:
- [x] 1. Write the browser regression check and confirm the missing-hero failure.
- [x] 2. Create the editable scene, inspect a still, render and encode the loop.
- [x] 3. Integrate native playback with accessible motion controls and fallbacks.
- [x] 4. Run checks, inspect desktop/mobile screenshots, and record exact results here.

Execution notes:
- User approval covers execution; no repeated confirmation is needed for these reversible implementation details.
- Existing package-lock was installed unchanged with npm ci --offline. A cross-drive dependency junction broke Next.js development paths, so the final build uses worktree-local dependencies.
- Keep all changes local. No push, merge, or deployment is part of this task.
- The loop runs independently of scroll, so the hero uses normal flow. This also lets short phone screens scroll through the copy and artwork without clipping.
- Review found the bottom motion control overlapped the quote card, and the old phone grid collapsed at 320x568. Both reproduced before fixes; control moved above the artwork and phone rows now keep their natural height.
- The independent review did not find additional playback or renderer defects.

Verified 2026-10-31:
- npm run typecheck passed; npm run build -- --webpack passed.
- scripts/verify-hero-animation.mjs passed on the production server: both landing languages at 1440x1000, 1024x768, 768x1000, 390x844, 320x844, 320x568, and 390x667.
- Native loop playback, explicit pause/resume, offscreen pause, simulated hidden-document pause, live reduced-motion changes, data-saving mode, restricted-autoplay manual play, failed-media fallback, no-JavaScript copy/poster, and unchanged CTA target passed. No browser runtime errors.
- Both review defects were reproduced before the fix and covered by the final browser checks. Inspected desktop and phone screenshots in the temporary handshakeos-blender-verification folder.
- H.264 MP4: 960x960, 24 fps, 6.000 seconds, no audio, 238111 bytes. Transparent WebP poster: 31664 bytes. Editable Blender file: 167445 bytes.
- All 41 scene objects return to their initial transform at frame 145, with maximum numeric delta 8.55e-18.
- Reproduce assets with: blender -b --python scripts/render-handshake-hero.py (FFmpeg on PATH). Add -- --preview to render only the poster.
- Original root checkout and production deployment were not changed. Preview: http://127.0.0.1:3165.

Production release authorized on 2026-10-31: "go commit and dploy".

The release branch starts at 9704533, which contains current main 9bf33fe plus the already-live v33 judge page. Preserve the current KitaKantin pitch, description page, dataset, country conversion details, and short-phone navigation spacing while applying only the Blender hero changes. The first development preview was based on older main and is not the release baseline. Production preflight found Worker 01954467-81fb-4164-a156-7cd655ae1776 serving v33 and the judge page; bindings and model variables are unchanged. No migrations belong to this release.

Release gates: run the hero regression and existing visual/user-flow checks against the combined source, push the release branch, inspect and merge its exact PR head, package from the merged source, deploy with --keep-vars, and verify live asset hashes, playback and preserved routes. Record the provider receipt separately from the source commit.

Combined candidate verification passed: production build and typecheck, all 14 hero viewport cases and fallback modes, the existing 21-case visual suite with the Naim evidence flow and print/returning-visitor checks, and the release smoke checks for security headers, keyboard focus, branded 404, validation routes and all 18 original asset hashes. Conflict resolution retained current main copy and narrow-screen spacing; no production configuration or migration was changed.

Main advanced to 57d427c during verification. It was merged into the release branch before publication, retaining the corrected /description route and expanded judge/country checks. Stale generated Next.js types initially referenced /descrition; rebuilding regenerated them and the subsequent typecheck passed. Independent source review confirmed current main behavior was preserved. Production baseline after the parallel release is Worker 462729eb-071b-45c0-9aaa-a9c586f389d2; its binding fingerprint matches the earlier preflight.

The expanded country-filter regression initially ran against a local server that inherited a model API key, so the result was not the expected fixture. The local server was restarted with model credentials removed from that child process. Production credentials were not touched. Repeatable workflow verification uses this explicit fixture mode.

Final combined checks passed: 14 hero viewport cases, 24 existing route/viewport cases, the complete Naim evidence walkthrough, country filtering, both print views, returning-visitor links, and the approved /description content at three widths. The local status endpoint confirmed live=false during the fixture-based workflow run. Existing security-header, keyboard, API-validation and asset-hash checks passed. All tests ran against the combined production build; no new dependencies or migrations were introduced.
