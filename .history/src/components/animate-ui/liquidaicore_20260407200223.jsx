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

  // The base geometry: 5 fully complete intersecting Toruses that overlap into a single "pipe"!
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

  // Material 1: The solid pipe
  const materialSolid = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#f5f5f5',
    metalness: 1,
    roughness: 0.2,
    clearcoat: 1,
    envMapIntensity: 1.5,
  }), []);

  // Material 2: The "alines of circle"
  const materialWire = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#888888',
    transparent: true,
    opacity: 0.4,
    wireframe: true,
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

      if (p === 0) { // Split seamlessly
        seg.target.set(
          Math.cos(angle) * r * t,
          Math.sin(angle * 0.5) * r * t,
          Math.sin(angle) * r * t * 0.5
        );
      } else if (p === 1) { // Float gently around
        seg.target.set(
          Math.cos(angle + t * Math.PI * 2) * 0.3,
          Math.sin(angle + t * Math.PI) * 0.3,
          Math.sin(angle + t * Math.PI * 2) * 0.1
        );
      } else { // Merge back
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
        // Slowly tumble out independently
        m.rotation.x += 0.006;
        m.rotation.y += 0.008;
      }
    });

    if (group.current) {
      group.current.scale.setScalar(1 + Math.sin(time * 1.2) * 0.05);
    }
  });

  return (
    <group ref={group}>
      {segmentsData.map((_, i) => (
        <group key={i} ref={(el) => (meshes.current[i] = el)}>
          {/* Base pipe */}
          <mesh geometry={geometry} material={materialSolid} />
          {/* Wireframe lines (alines of circle) */}
          <mesh geometry={geometry} material={materialWire} scale={[1.005, 1.005, 1.005]} />
        </group>
      ))}
    </group>
  );
};

export default function HeroAnimation({ embedded = false }) {
  // Graceful failure wrapper
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return <div style={{ width: '100%', height: embedded ? '100%' : '100vh', background: 'transparent' }} />;
  }

  return (
    <div 
      style={{ 
        width: '100%', 
        height: embedded ? '100%' : '100vh', 
        position: embedded ? 'absolute' : 'relative',
        top: embedded ? 0 : 'auto',
        left: embedded ? 0 : 'auto',
        right: embedded ? 0 : 'auto',
        bottom: embedded ? 0 : 'auto',
        background: 'transparent',
        zIndex: embedded ? 0 : 'auto',
        overflow: 'hidden',
        pointerEvents: 'none' // Click passthrough
      }}
    >
      <Canvas 
        camera={{ position: [0, 0, 4] }}
        gl={{ alpha: true, antialias: true, pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1 }}
        dpr={[1, 2]}
        onError={() => setHasError(true)}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 7]} intensity={1.5} castShadow />
        <OrbitControls autoRotate autoRotateSpeed={2} enableZoom={false} enablePan={false} />
        <LiquidCore />
      </Canvas>
    </div>
  );
}
