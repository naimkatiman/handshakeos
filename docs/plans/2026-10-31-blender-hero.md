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
