import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture, OrbitControls, Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Orbiting ring ─── */
function OrbitRing({ radius, tube, color, speed, tiltX, tiltZ, phase = 0 }) {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * speed + phase;
  });
  return (
    <mesh ref={ref} rotation={[tiltX, 0, tiltZ]}>
      <torusGeometry args={[radius, tube, 16, 120]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.8}
        roughness={0.1}
        metalness={0.9}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

/* ─── Particle field ─── */
function Particles({ count = 70 }) {
  const ref = useRef();

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const a = new THREE.Color('#7c3aed');
    const b = new THREE.Color('#c4b5fd');
    for (let i = 0; i < count; i++) {
      const r     = 2.0 + Math.random() * 1.2;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      const c = a.clone().lerp(b, Math.random());
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * 0.05;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color"    args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.022}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* ─── 3D medallion with real depth ─── */
function LogoMedallion() {
  const groupRef = useRef();
  const texture  = useTexture('/oregent-logo.png');

  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  const [sideMat, faceMat, backMat] = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({
      color: '#3b1f6e',
      metalness: 0.95,
      roughness: 0.1,
      envMapIntensity: 2,
    });
    const face = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.02,
      metalness: 0.4,
      roughness: 0.35,
      emissiveMap: texture,
      emissive: new THREE.Color(0.45, 0.25, 1.0),
      emissiveIntensity: 0.55,
      envMapIntensity: 1,
      toneMapped: false,
    });
    const back = new THREE.MeshStandardMaterial({
      color: '#4c1d95',
      metalness: 0.95,
      roughness: 0.1,
      envMapIntensity: 2,
    });
    return [side, face, back];
  }, [texture]);

  useFrame(({ clock, mouse }) => {
    if (!groupRef.current) return;
    // Slow auto-spin + mouse parallax tilt
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y += 0.004;
    groupRef.current.rotation.x += (mouse.y * -0.18 - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.z += (mouse.x *  0.06 - groupRef.current.rotation.z) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/* Real 3D disc — three material groups: 0=sides, 1=top cap, 2=bottom cap */}
      <mesh material={[sideMat, faceMat, backMat]}>
        <cylinderGeometry args={[1.5, 1.5, 0.28, 128, 1, false]} />
      </mesh>

      {/* Glowing rim edge */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.505, 0.025, 16, 128]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#7c3aed"
          emissiveIntensity={2}
          metalness={1}
          roughness={0}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

/* ─── Root scene ─── */
export default function OregentLogo3D() {
  return (
    <>
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight position={[3, 5, 4]}  intensity={2.5} color="#ffffff" />
      <pointLight       position={[0, 0, -4]}  intensity={5}   color="#7c3aed" />
      <pointLight       position={[-3, 2, 2]}  intensity={1.5} color="#c4b5fd" />
      <pointLight       position={[3, -2, 2]}  intensity={1.0} color="#a78bfa" />

      <Environment preset="city" />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.5}
      />

      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.5}>
        <LogoMedallion />
      </Float>

      {/* Tighter orbit rings */}
      <OrbitRing radius={1.80} tube={0.007} color="#7c3aed" speed={0.6}   tiltX={Math.PI / 2.2} tiltZ={0}            />
      <OrbitRing radius={2.05} tube={0.005} color="#a78bfa" speed={-0.42} tiltX={Math.PI / 4}   tiltZ={Math.PI / 7}  phase={1.2} />
      <OrbitRing radius={2.30} tube={0.004} color="#c4b5fd" speed={0.30}  tiltX={Math.PI / 6}   tiltZ={-Math.PI / 5} phase={2.4} />

      <Particles count={70} />
    </>
  );
}
