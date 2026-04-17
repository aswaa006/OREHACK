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
        emissiveIntensity={1.2}
        roughness={0.05}
        metalness={0.95}
        transparent
        opacity={0.75}
      />
    </mesh>
  );
}


/* ─── 3D medallion with logo on BOTH front and back ─── */
function LogoMedallion() {
  const groupRef = useRef();
  const texture = useTexture('/oregent logo black.png');

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
    // Barrel edge — matte near-black; low metalness so it doesn't pick up environment reflections
    const side = new THREE.MeshStandardMaterial({
      color: '#080808',
      metalness: 0.2,
      roughness: 0.75,
      envMapIntensity: 0.05,  // near-zero: no environment shimmer
    });

    // Front face — black logo on white disc
    // emissive is black so the face doesn't glow/wash out on white bg
    const front = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      alphaTest: 0.02,
      metalness: 0.2,
      roughness: 0.55,
      emissiveMap: texture,
      emissive: new THREE.Color(0.0, 0.0, 0.0),   // no purple glow — stays clean
      emissiveIntensity: 0.0,
      envMapIntensity: 0.1,
      toneMapped: true,
    });

    // Back face — mirrored logo, same dark treatment
    const back = new THREE.MeshStandardMaterial({
      map: textureBack,
      transparent: true,
      alphaTest: 0.02,
      metalness: 0.2,
      roughness: 0.55,
      emissiveMap: textureBack,
      emissive: new THREE.Color(0.0, 0.0, 0.0),
      emissiveIntensity: 0.0,
      envMapIntensity: 0.1,
      toneMapped: true,
    });

    return [side, front, back];
  }, [texture, textureBack]);

  useFrame(({ mouse }) => {
    if (!groupRef.current) return;
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

      {/* Glowing outer rim — dark purple, readable against white */}
      <mesh>
        <torusGeometry args={[1.505, 0.028, 16, 128]} />
        <meshStandardMaterial
          color="#2d1060"
          emissive="#3b1f6e"
          emissiveIntensity={2.0}
          metalness={1}
          roughness={0}
          transparent
          opacity={0.95}
          toneMapped={false}
        />
      </mesh>

      {/* Inner accent ring — dark indigo */}
      <mesh>
        <torusGeometry args={[1.1, 0.012, 16, 128]} />
        <meshStandardMaterial
          color="#1a0845"
          emissive="#2d1060"
          emissiveIntensity={1.8}
          metalness={1}
          roughness={0}
          transparent
          opacity={0.7}
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
      {/* Softer neutral ambient — prevents washing the dark body to grey */}
      <ambientLight intensity={0.35} color="#d0d0d0" />

      {/* Key light from front-top — cool white, moderate */}
      <directionalLight position={[3, 5, 4]}  intensity={1.4} color="#e8e8e8" />
      {/* Fill light from back-bottom — very dim */}
      <directionalLight position={[-3, -5, -4]} intensity={0.5} color="#cccccc" />

      {/* Deep purple rim lights — give the dark body depth without washing it */}
      <pointLight position={[0, 0, -4]} intensity={3.0} color="#3b1f6e" />
      <pointLight position={[0, 0,  4]} intensity={3.0} color="#3b1f6e" />
      <pointLight position={[-3, 2,  2]} intensity={0.8} color="#1a0845" />
      <pointLight position={[ 3, -2,  2]} intensity={0.6} color="#2d1060" />
      <pointLight position={[-3, 2, -2]} intensity={0.8} color="#1a0845" />

      {/* Night environment — very dark, only subtle reflections on rings */}
      <Environment preset="night" />

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

      {/* Orbit rings — dark purple tones, clearly visible on white */}
      <OrbitRing radius={1.7}  tube={0.007} color="#3b1f6e" speed={0.6}   tiltX={Math.PI / 2.6} tiltZ={0} />
      <OrbitRing radius={1.85} tube={0.005} color="#4c2a8a" speed={-0.42} tiltX={Math.PI / 2.6} tiltZ={0} phase={1.2} />
      <OrbitRing radius={2.0}  tube={0.004} color="#2d1060" speed={0.30}  tiltX={Math.PI / 2.6} tiltZ={0} phase={2.4} />

    </>
  );
}
