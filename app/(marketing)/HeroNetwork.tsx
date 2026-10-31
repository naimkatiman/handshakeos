"use client";
import { useEffect, useRef } from "react";

// A field of business cards. Most are noise and drift away as the hero scrolls; six carry verified
// evidence, light up, and get threaded to you. three.js loads on demand so it never blocks first paint.
const VERIFIED = 6;
const TEAL = 0x4fd1ae;
const MIST = 0xa3acb6;

export default function HeroNetwork() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    // Phones get the art-directed clip instead of the card field: less clutter, no WebGL battery cost.
    if (innerWidth < 860) return;
    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: true, powerPreference: "low-power" });
      } catch {
        return; // No WebGL: the photographic plate carries the hero on its own.
      }
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const coarse = matchMedia("(pointer: coarse)").matches;
      const narrow = innerWidth < 860;
      const count = narrow ? 70 : 150;

      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
      camera.position.set(0, 0, 9);
      const rig = new THREE.Group();
      scene.add(rig);

      // Seeded so every visitor sees the same composition.
      let seed = 7;
      const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      const hub = new THREE.Vector3(narrow ? 0 : -0.6, narrow ? 0.9 : -0.1, 0.6);
      const spread = narrow ? { x: 3.2, y: 2.4 } : { x: 3.6, y: 2.8 };

      // A business card face drawn once: rounded card, a name bar, two lines of detail. Material colour tints it.
      const face = document.createElement("canvas");
      face.width = 256;
      face.height = 150;
      const g = face.getContext("2d")!;
      g.fillStyle = "rgba(255,255,255,0.9)";
      g.beginPath();
      g.roundRect(4, 4, 248, 142, 14);
      g.fill();
      g.fillStyle = "rgba(11,15,20,0.55)";
      g.fillRect(24, 34, 120, 16);
      g.fillStyle = "rgba(11,15,20,0.28)";
      g.fillRect(24, 92, 170, 9);
      g.fillRect(24, 110, 110, 9);
      const tex = new THREE.CanvasTexture(face);
      tex.colorSpace = THREE.SRGBColorSpace;
      const card = new THREE.PlaneGeometry(0.4, 0.234);
      const dimMat = new THREE.MeshBasicMaterial({ map: tex, color: MIST, transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false });
      const litMat = new THREE.MeshBasicMaterial({ map: tex, color: TEAL, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
      const dim = new THREE.InstancedMesh(card, dimMat, count - VERIFIED);
      const lit = new THREE.InstancedMesh(card, litMat, VERIFIED);
      rig.add(dim, lit);

      type Body = { base: InstanceType<typeof THREE.Vector3>; rot: InstanceType<typeof THREE.Euler>; phase: number; out: InstanceType<typeof THREE.Vector3> };
      const make = (r: number): Body => {
        const base = new THREE.Vector3(hub.x + (rand() - 0.5) * 2 * spread.x * r, hub.y + (rand() - 0.5) * 2 * spread.y * r, (rand() - 0.6) * 5);
        return { base, rot: new THREE.Euler(rand() * 0.9 - 0.45, rand() * 1.4 - 0.7, rand() * 0.6 - 0.3), phase: rand() * Math.PI * 2, out: base.clone().sub(hub).normalize() };
      };
      const dimBodies = Array.from({ length: count - VERIFIED }, () => make(1));
      const litBodies = Array.from({ length: VERIFIED }, () => make(0.62));

      const hubDot = new THREE.Mesh(new THREE.RingGeometry(0.11, 0.16, 40), new THREE.MeshBasicMaterial({ color: 0xf2efe8, transparent: true, opacity: 0 }));
      hubDot.position.copy(hub);
      rig.add(hubDot);

      const linePos = new Float32Array(VERIFIED * 6);
      const lineGeo = new THREE.BufferGeometry();
      lineGeo.setAttribute("position", new THREE.BufferAttribute(linePos, 3));
      const lineMat = new THREE.LineBasicMaterial({ color: TEAL, transparent: true, opacity: 0.75 });
      const lines = new THREE.LineSegments(lineGeo, lineMat);
      rig.add(lines);

      const m = new THREE.Matrix4();
      const q = new THREE.Quaternion();
      const v = new THREE.Vector3();
      const one = new THREE.Vector3(1, 1, 1);
      const section = el.closest("section");
      const pointer = { x: 0, y: 0 };
      const start = performance.now();

      const ease = (x: number) => 1 - Math.pow(1 - Math.min(Math.max(x, 0), 1), 3);
      const frame = (now: number) => {
        const t = reduce ? 10 : (now - start) / 1000;
        const p = section ? parseFloat(getComputedStyle(section).getPropertyValue("--sc-p")) || 0 : 0;
        const intro = ease(t / 1.4); // cards settle in
        const light = ease((t - 1.1) / 1.2); // verified ones light up, threads draw

        dimBodies.forEach((b, i) => {
          const drift = 0.35 * (1 - intro) + p * 2.6;
          v.copy(b.base).addScaledVector(b.out, drift);
          v.y += Math.sin(t * 0.5 + b.phase) * 0.06;
          q.setFromEuler(new THREE.Euler(b.rot.x + t * 0.05, b.rot.y + Math.sin(t * 0.3 + b.phase) * 0.15, b.rot.z));
          dim.setMatrixAt(i, m.compose(v, q, one));
        });
        dimMat.opacity = 0.32 * intro * (1 - p * 0.9);
        dim.instanceMatrix.needsUpdate = true;

        litBodies.forEach((b, i) => {
          v.copy(b.base).lerp(hub, 0.18 + p * 0.25);
          v.y += Math.sin(t * 0.6 + b.phase) * 0.05;
          q.setFromEuler(new THREE.Euler(b.rot.x * (1 - p), b.rot.y * (1 - p), b.rot.z * (1 - p)));
          lit.setMatrixAt(i, m.compose(v, q, one.clone().multiplyScalar(1.12)));
          linePos.set([hub.x, hub.y, hub.z, hub.x + (v.x - hub.x) * light, hub.y + (v.y - hub.y) * light, hub.z + (v.z - hub.z) * light], i * 6);
        });
        lit.instanceMatrix.needsUpdate = true;
        litMat.opacity = 0.2 + 0.75 * light;
        lineMat.opacity = 0.7 * light;
        lineGeo.attributes.position.needsUpdate = true;
        (hubDot.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = light;

        rig.rotation.y += (pointer.x * 0.22 - rig.rotation.y) * 0.05;
        rig.rotation.x += (pointer.y * 0.12 - rig.rotation.x) * 0.05;
        renderer.render(scene, camera);
      };

      const resize = () => {
        const w = el.clientWidth, h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        if (reduce) frame(performance.now());
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      const onMove = (e: PointerEvent) => {
        pointer.x = e.clientX / innerWidth - 0.5;
        pointer.y = e.clientY / innerHeight - 0.5;
      };
      if (!coarse && !reduce) addEventListener("pointermove", onMove, { passive: true });

      // Only animate while the hero is on screen.
      let raf = 0;
      const loop = (now: number) => {
        frame(now);
        raf = requestAnimationFrame(loop);
      };
      const io = new IntersectionObserver(([entry]) => {
        cancelAnimationFrame(raf);
        if (entry.isIntersecting && !reduce) raf = requestAnimationFrame(loop);
      });
      if (reduce) frame(performance.now());
      else io.observe(el);
      el.dataset.ready = "1";

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        removeEventListener("pointermove", onMove);
        [card, lineGeo, hubDot.geometry].forEach((geo) => geo.dispose());
        tex.dispose();
        [dimMat, litMat, lineMat, hubDot.material as InstanceType<typeof THREE.MeshBasicMaterial>].forEach((mat) => mat.dispose());
        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, []);

  return <canvas ref={canvas} className="hero__net" aria-hidden="true" />;
}
