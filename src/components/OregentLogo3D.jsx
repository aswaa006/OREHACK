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


/* ─── 3D medallion with logo on BOTH front and back ─── */
function LogoMedallion() {
  const groupRef = useRef();
  const texture = useTexture('/oregent-logo.png');

  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  // Flipped texture for the back face
  const textureBack = useMemo(() => {
    const t = texture.clone();
    t.needsUpdate = true;
    // Mirror horizontally so back logo faces outward correctly
    t.repeat.set(-1, 1);
    t.offset.set(1, 0);
    t.wrapS = THREE.RepeatWrapping;
    return t;
  }, [texture]);

  const [sideMat, frontMat, backMat] = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({
      color: '#3b1f6e',
      metalness: 0.95,
      roughness: 0.1,
      envMapIntensity: 2,
    });

    const front = new THREE.MeshStandardMaterial({
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
      map: textureBack,
      transparent: true,
      alphaTest: 0.02,
      metalness: 0.4,
      roughness: 0.35,
      emissiveMap: textureBack,
      emissive: new THREE.Color(0.45, 0.25, 1.0),
      emissiveIntensity: 0.55,
      envMapIntensity: 1,
      toneMapped: false,
    });

    return [side, front, back];
  }, [texture, textureBack]);

  useFrame(({ clock, mouse }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y += 0.004;
    groupRef.current.rotation.x += (mouse.y * -0.18 - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.z += (mouse.x * 0.06 - groupRef.current.rotation.z) * 0.05;
  });

  return (
    <group ref={groupRef}>
      {/*
        CylinderGeometry material group order:
          index 0 → side (curved barrel)
          index 1 → top cap  (front face, +Y)
          index 2 → bottom cap (back face, -Y)
        The disc is rotated so +Y faces the viewer by default from the Canvas camera.
      */}
      <mesh
        material={[sideMat, frontMat, backMat]}
        rotation={[Math.PI / 2, 0, 0]}  /* Rotate so caps face camera (Z-axis) */
      >
        <cylinderGeometry args={[1.5, 1.5, 0.28, 128, 1, false]} />
      </mesh>

      {/* Glowing outer rim */}
      <mesh>
        <torusGeometry args={[1.505, 0.028, 16, 128]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#7c3aed"
          emissiveIntensity={2.5}
          metalness={1}
          roughness={0}
          transparent
          opacity={0.9}
          toneMapped={false}
        />
      </mesh>

      {/* Inner accent ring */}
      <mesh>
        <torusGeometry args={[1.1, 0.012, 16, 128]} />
        <meshStandardMaterial
          color="#c4b5fd"
          emissive="#6d28d9"
          emissiveIntensity={1.5}
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

/* ─── Root scene export ─── */
export default function OregentLogo3D() {
  return (
    <>
      <ambientLight intensity={0.6} color="#ffffff" />
      <directionalLight position={[3, 5, 4]} intensity={2.5} color="#ffffff" />
      <directionalLight position={[-3, -5, -4]} intensity={1.5} color="#ffffff" />
      <pointLight position={[0, 0, -4]} intensity={5} color="#7c3aed" />
      <pointLight position={[0, 0, 4]} intensity={5} color="#7c3aed" />
      <pointLight position={[-3, 2, 2]} intensity={1.5} color="#c4b5fd" />
      <pointLight position={[3, -2, 2]} intensity={1.0} color="#a78bfa" />
      <pointLight position={[-3, 2, -2]} intensity={1.5} color="#c4b5fd" />

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

      {/* Orbit rings */}
      <OrbitRing radius={1.7} tube={0.007} color="#7c3aed" speed={0.6} tiltX={Math.PI / 2.6} tiltZ={0} />
      <OrbitRing radius={1.85} tube={0.005} color="#a78bfa" speed={-0.42} tiltX={Math.PI / 2.6} tiltZ={0} phase={1.2} />
      <OrbitRing radius={2.0} tube={0.004} color="#c4b5fd" speed={0.30} tiltX={Math.PI / 2.6} tiltZ={0} phase={2.4} />

    </>
  );
}
