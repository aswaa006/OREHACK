import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useTexture, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';


/* ── Slow spinning orbit ring ── */
function OrbitRing({ radius, tube, color, speed, tiltX, tiltZ, phase = 0 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * speed + phase;
  });
  return (
    <mesh ref={ref} rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, tube, 16, 100]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.6}
        roughness={0.1}
        metalness={0.9}
        transparent
        opacity={0.35}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* ── Central 3D logo medallion ── */
function LogoMedallion() {
  const groupRef = useRef();
  const texture = useTexture('/oregent-logo.png');

  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const [sideMat, faceMat, backMat] = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({
      color: '#1e0a3c',
      metalness: 0.98,
      roughness: 0.08,
      envMapIntensity: 2.5,
    });
    const face = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.01,
      metalness: 0.3,
      roughness: 0.3,
      emissiveMap: texture,
      emissive: new THREE.Color(0.4, 0.2, 1.0),
      emissiveIntensity: 0.6,
      envMapIntensity: 1.2,
      toneMapped: false,
    });
    const back = new THREE.MeshStandardMaterial({
      color: '#2d0f6b',
      metalness: 0.98,
      roughness: 0.08,
      envMapIntensity: 2.5,
    });
    return [side, face, back];
  }, [texture]);

  useFrame(({ clock, mouse }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    // Slow Y auto-spin
    groupRef.current.rotation.y = t * 0.18;
    // Gentle mouse parallax tilt
    groupRef.current.rotation.x += (mouse.y * -0.12 - groupRef.current.rotation.x) * 0.04;
    groupRef.current.rotation.z += (mouse.x *  0.05 - groupRef.current.rotation.z) * 0.04;
  });

  return (
    <group ref={groupRef}>
      {/* 3D disc; material groups: 0=side, 1=front cap, 2=back cap */}
      <mesh material={[sideMat, faceMat, backMat]}>
        <cylinderGeometry args={[2.5, 2.5, 0.35, 128, 1, false]} />
      </mesh>

      {/* Glowing rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.508, 0.03, 16, 128]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#7c3aed"
          emissiveIntensity={3}
          metalness={1}
          roughness={0}
          transparent
          opacity={0.85}
          toneMapped={false}
        />
      </mesh>

      {/* Inner accent ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.8, 0.015, 16, 128]} />
        <meshStandardMaterial
          color="#c4b5fd"
          emissive="#6d28d9"
          emissiveIntensity={2}
          metalness={1}
          roughness={0}
          transparent
          opacity={0.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* ── Full scene ── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} color="#ffffff" />
      <directionalLight position={[5, 8, 5]}   intensity={2}   color="#ffffff" />
      <pointLight       position={[0, 0, -5]}   intensity={8}   color="#7c3aed" />
      <pointLight       position={[-5, 3, 3]}   intensity={2}   color="#c4b5fd" />
      <pointLight       position={[5, -3, 3]}   intensity={1.5} color="#a78bfa" />
      <pointLight       position={[0, -6, 0]}   intensity={1}   color="#4c1d95" />

      <Environment preset="city" />

      <Float speed={0.8} rotationIntensity={0.05} floatIntensity={0.3}>
        <LogoMedallion />
      </Float>

      {/* Orbit rings at various tilts */}
      <OrbitRing radius={3.0} tube={0.008} color="#7c3aed" speed={0.25}   tiltX={Math.PI / 2.6} tiltZ={0}             />
      <OrbitRing radius={3.5} tube={0.005} color="#a78bfa" speed={-0.18}  tiltX={Math.PI / 2.6} tiltZ={0}  phase={1.0} />
      <OrbitRing radius={4.0} tube={0.004} color="#c4b5fd" speed={0.14}   tiltX={Math.PI / 2.6} tiltZ={0} phase={2.1} />
      <OrbitRing radius={4.5} tube={0.003} color="#6d28d9" speed={-0.10}  tiltX={Math.PI / 2.6} tiltZ={0}  phase={3.5} />
    </>
  );
}

/* ── Error boundary ── */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(err) { console.error('ThreeBackground:', err); }
  render() { return this.state.hasError ? null : this.props.children; }
}

/* ── Root export — fixed full-screen canvas, pointer-events none ── */
export default function ThreeBackground() {
  return (
    <ErrorBoundary>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: '#030305',
        }}
      >
        <Canvas
          dpr={[1, 1.5]}
          camera={{ position: [0, 0, 10], fov: 50 }}
          gl={{ antialias: false, alpha: false }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
    </ErrorBoundary>
  );
}
