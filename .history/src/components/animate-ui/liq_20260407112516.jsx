// 🔥 EXACT MATCH VERSION (restored complexity)
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const PHASE = { SPLIT: 0, FLOAT: 1, MERGE: 2 };
const DUR = { split: 0.25, float: 0.3, merge: 0.25 };
const TOTAL = DUR.split + DUR.float + DUR.merge;

const LiquidCore = ({ segments = 5 }) => {
  const group = useRef();
  const meshes = useRef([]);
  const clock = useRef(new THREE.Clock());

  // Geometry
  const geometry = useMemo(() => {
    const g = new THREE.TorusGeometry(1.2, 0.5, 64, 100);
    const pos = g.attributes.position.array;

    for (let i = 0; i < pos.length; i += 3) {
      const x = pos[i], y = pos[i + 1], z = pos[i + 2];
      const d = Math.sqrt(x * x + y * y + z * z);
      const n = Math.sin(d * 3) * 0.08;

      pos[i] += (x / d) * n;
      pos[i + 1] += (y / d) * n;
      pos[i + 2] += (z / d) * n;
    }
    return g;
  }, []);

  const material = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#f5f5f5',
    metalness: 1,
    roughness: 0.2,
    clearcoat: 1,
    envMapIntensity: 1.5
  }), []);

  const segmentsData = useMemo(() =>
    Array.from({ length: segments }).map(() => ({
      pos: new THREE.Vector3(),
      target: new THREE.Vector3()
    }))
  , [segments]);

  const getPhase = (t) => {
    const c = t % TOTAL;
    if (c < DUR.split) return { p: 0, t: c / DUR.split };
    if (c < DUR.split + DUR.float) return { p: 1, t: (c - DUR.split) / DUR.float };
    return { p: 2, t: (c - DUR.split - DUR.float) / DUR.merge };
  };

  useFrame(() => {
    const time = clock.current.getElapsedTime();
    const { p, t } = getPhase(time);

    segmentsData.forEach((seg, i) => {
      const angle = (i / segments) * Math.PI * 2;
      const r = 0.8;

      if (p === 0) {
        seg.target.set(
          Math.cos(angle) * r * t,
          Math.sin(angle * 0.5) * r * t,
          Math.sin(angle) * r * t * 0.5
        );
      } else if (p === 1) {
        seg.target.set(
          Math.cos(angle + t * Math.PI * 2) * 0.3,
          Math.sin(angle + t * Math.PI) * 0.3,
          Math.sin(angle + t * Math.PI * 2) * 0.1
        );
      } else {
        const inv = 1 - t;
        seg.target.set(
          Math.cos(angle) * r * inv,
          Math.sin(angle * 0.5) * r * inv,
          Math.sin(angle) * r * inv * 0.5
        );
      }

      seg.pos.lerp(seg.target, 0.12);

      const m = meshes.current[i];
      if (m) {
        m.position.copy(seg.pos);
        m.rotation.x += 0.006;
        m.rotation.y += 0.008;
      }
    });

    group.current.scale.setScalar(1 + Math.sin(time * 1.2) * 0.05);
  });

  return (
    <group ref={group}>
      {segmentsData.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (meshes.current[i] = el)}
          geometry={geometry.clone()}
          material={material}
        />
      ))}
    </group>
  );
};

export default function App() {
  return (
    <Canvas camera={{ position: [0, 0, 4] }}>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <OrbitControls autoRotate />
      <LiquidCore />
    </Canvas>
  );
}