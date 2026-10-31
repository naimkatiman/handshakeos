"use client";
import { useEffect, useRef } from "react";

// Business capitals of ASEAN members, [lat, lon]. Myanmar uses Yangon, where its deal flow is.
export const HUBS: Record<string, { city: string; at: [number, number] }> = {
  Malaysia: { city: "Kuala Lumpur", at: [3.139, 101.687] },
  Singapore: { city: "Singapore", at: [1.352, 103.82] },
  Indonesia: { city: "Jakarta", at: [-6.209, 106.846] },
  Philippines: { city: "Manila", at: [14.6, 120.984] },
  Thailand: { city: "Bangkok", at: [13.756, 100.502] },
  Vietnam: { city: "Hanoi", at: [21.028, 105.834] },
  Cambodia: { city: "Phnom Penh", at: [11.556, 104.928] },
  Laos: { city: "Vientiane", at: [17.976, 102.633] },
  Myanmar: { city: "Yangon", at: [16.841, 96.174] },
  Brunei: { city: "Bandar Seri Begawan", at: [4.903, 114.94] },
};

export type Corridor = { from: string; to: string; n: number; maxStage: number; moved: number };

/** "Malaysia → Singapore" → ["Malaysia", "Singapore"]; "Malaysia" → ["Malaysia", "Malaysia"]. Unknown countries → null. */
export function parseCorridor(s?: string): [string, string] | null {
  const parts = (s ?? "").split(/→|->/).map((x) => x.trim()).filter(Boolean);
  if (!parts.length || !parts.every((p) => HUBS[p])) return null;
  return [parts[0], parts[parts.length - 1]];
}

const STAGE_COLOR = [0x8a939d, 0xf0b14a, 0x4fd1ae, 0xd8fff2];
const project = ([lat, lon]: [number, number]) => [(lon - 108.5) * 0.26, (lat - 7.5) * 0.26] as const;

export default function CorridorMap({ corridors, selected, onSelect }: { corridors: Corridor[]; selected: string | null; onSelect: (country: string | null) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const labels = useRef<Record<string, HTMLButtonElement | null>>({});
  const selectedRef = useRef(selected);
  selectedRef.current = selected;
  const key = JSON.stringify(corridors);

  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    let disposed = false;
    let cleanup = () => {};

    import("three").then((THREE) => {
      if (disposed) return;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ canvas: el, alpha: true, antialias: true, powerPreference: "low-power" });
      } catch {
        return;
      }
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
      const rig = new THREE.Group();
      rig.rotation.x = -0.5;
      scene.add(rig);
      const disposables: { dispose: () => void }[] = [];
      const keep = <T extends { dispose: () => void }>(x: T) => (disposables.push(x), x);

      // Sea of dots: the grid gives the plane depth without needing coastline data.
      const dots: number[] = [];
      for (let x = -4.4; x <= 4.4; x += 0.22) for (let y = -4.1; y <= 4.1; y += 0.22) dots.push(x, y, 0);
      const dotGeo = keep(new THREE.BufferGeometry());
      dotGeo.setAttribute("position", new THREE.Float32BufferAttribute(dots, 3));
      rig.add(new THREE.Points(dotGeo, keep(new THREE.PointsMaterial({ color: 0x34404d, size: 0.035 }))));

      const nodeGeo = keep(new THREE.CircleGeometry(0.07, 24));
      const nodeMat = keep(new THREE.MeshBasicMaterial({ color: 0xf2efe8 }));
      const pos = (c: string) => {
        const [x, y] = project(HUBS[c].at);
        return new THREE.Vector3(x, y, 0.01);
      };
      const active = new Set(corridors.flatMap((c) => [c.from, c.to]));
      for (const c of Object.keys(HUBS)) {
        const node = new THREE.Mesh(nodeGeo, active.has(c) ? nodeMat : keep(new THREE.MeshBasicMaterial({ color: 0x4a5561 })));
        node.position.copy(pos(c));
        rig.add(node);
      }

      type Flow = { curve: InstanceType<typeof THREE.QuadraticBezierCurve3>; pts: InstanceType<typeof THREE.Points>; attr: InstanceType<typeof THREE.Float32BufferAttribute>; n: number; mats: { line: InstanceType<typeof THREE.LineBasicMaterial> }; c: Corridor; ring?: InstanceType<typeof THREE.Mesh> };
      const flows: Flow[] = corridors.map((c) => {
        const a = pos(c.from), b = pos(c.to);
        const color = STAGE_COLOR[Math.min(c.maxStage, 3)];
        const line = keep(new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 }));
        let curve: InstanceType<typeof THREE.QuadraticBezierCurve3>;
        let ring: InstanceType<typeof THREE.Mesh> | undefined;
        if (c.from === c.to) {
          // Domestic: a ring around the city, wider with more deals.
          ring = new THREE.Mesh(keep(new THREE.RingGeometry(0.14 + c.n * 0.03, 0.165 + c.n * 0.03, 48)), keep(new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.8 })));
          ring.position.copy(a);
          rig.add(ring);
          curve = new THREE.QuadraticBezierCurve3(a, a, a);
        } else {
          const mid = a.clone().add(b).multiplyScalar(0.5);
          mid.z = a.distanceTo(b) * 0.45;
          curve = new THREE.QuadraticBezierCurve3(a, mid, b);
          const g = keep(new THREE.BufferGeometry().setFromPoints(curve.getPoints(64)));
          rig.add(new THREE.Line(g, line));
        }
        // Particles only where something verifiably moved past Introduced.
        const n = c.from === c.to ? 0 : c.moved * 3;
        const pg = keep(new THREE.BufferGeometry());
        const attr = new THREE.Float32BufferAttribute(new Float32Array(Math.max(n, 1) * 3), 3);
        pg.setAttribute("position", attr);
        const pts = new THREE.Points(pg, keep(new THREE.PointsMaterial({ color, size: 0.09, transparent: true, opacity: n ? 1 : 0 })));
        rig.add(pts);
        return { curve, pts, attr, n, mats: { line }, c, ring };
      });

      const v = new THREE.Vector3();
      const pointer = { x: 0, y: 0 };
      const start = performance.now();
      const frame = (now: number) => {
        const t = reduce ? 0 : (now - start) / 1000;
        const sel = selectedRef.current;
        for (const f of flows) {
          const on = !sel || f.c.from === sel || f.c.to === sel;
          f.mats.line.opacity = on ? 0.85 : 0.12;
          if (f.ring) (f.ring.material as InstanceType<typeof THREE.MeshBasicMaterial>).opacity = (on ? 0.8 : 0.12) * (reduce ? 1 : 0.75 + 0.25 * Math.sin(t * 2));
          if (!f.n) continue;
          (f.pts.material as InstanceType<typeof THREE.PointsMaterial>).opacity = on ? 1 : 0.1;
          const arr = f.attr.array as Float32Array;
          for (let i = 0; i < f.n; i++) {
            f.curve.getPoint(((t * 0.22 + i / f.n) % 1 + 1) % 1, v);
            arr.set([v.x, v.y, v.z], i * 3);
          }
          f.attr.needsUpdate = true;
        }
        rig.rotation.z += (pointer.x * 0.12 - rig.rotation.z) * 0.05;
        rig.rotation.x += (-0.5 + pointer.y * 0.08 - rig.rotation.x) * 0.05;
        renderer.render(scene, camera);

        // Pin each HTML label (a real button) over its city.
        rig.updateMatrixWorld();
        const w = el.clientWidth, h = el.clientHeight;
        for (const c of Object.keys(HUBS)) {
          const b = labels.current[c];
          if (!b) continue;
          v.copy(pos(c)).applyMatrix4(rig.matrixWorld).project(camera);
          b.style.transform = `translate(${((v.x + 1) / 2) * w}px, ${((1 - v.y) / 2) * h}px)`;
        }
      };

      const resize = () => {
        const w = el.clientWidth, h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Fit the region: pull back on narrow screens.
        camera.position.set(0, -0.3, w / h < 1 ? 15.5 : 9.2);
        camera.lookAt(0, -0.15, 0);
        camera.updateProjectionMatrix();
        frame(performance.now());
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      const onMove = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        pointer.x = (e.clientX - r.left) / r.width - 0.5;
        pointer.y = (e.clientY - r.top) / r.height - 0.5;
      };
      if (!reduce) el.parentElement?.addEventListener("pointermove", onMove, { passive: true });

      let raf = 0;
      const loop = (now: number) => {
        frame(now);
        raf = requestAnimationFrame(loop);
      };
      const io = new IntersectionObserver(([entry]) => {
        cancelAnimationFrame(raf);
        if (entry.isIntersecting) raf = requestAnimationFrame(loop);
      });
      io.observe(el);
      el.dataset.ready = "1";

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        el.parentElement?.removeEventListener("pointermove", onMove);
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
    // Rebuild the scene only when the corridor data changes; selection is read live from a ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const active = new Set(corridors.flatMap((c) => [c.from, c.to]));
  return (
    <div className="relative h-[340px] overflow-hidden rounded-xl bg-[#0b0f14] sm:h-[440px]">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0">
        {Object.entries(HUBS).map(([country, h]) => (
          <button
            key={country}
            ref={(b) => {
              labels.current[country] = b;
            }}
            disabled={!active.has(country)}
            aria-pressed={selected === country}
            onClick={() => onSelect(selected === country ? null : country)}
            className={`pointer-events-auto absolute left-0 top-0 -ml-2 mt-2 whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-medium transition-colors disabled:pointer-events-none ${
              selected === country ? "bg-[#4fd1ae] text-[#06231c]" : active.has(country) ? "text-[#f2efe8] hover:bg-white/10" : "text-white/30"
            }`}
          >
            {country}
          </button>
        ))}
      </div>
      <ul className="pointer-events-none absolute bottom-3 left-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-white/60">
        {["Introduced", "Meeting held", "POC launched", "Partnership signed"].map((s, i) => (
          <li key={s} className="flex items-center gap-1.5">
            <span className="h-0.5 w-4 rounded" style={{ background: `#${STAGE_COLOR[i].toString(16).padStart(6, "0")}` }} />
            {s}
          </li>
        ))}
      </ul>
    </div>
  );
}
