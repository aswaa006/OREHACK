import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Float, OrbitControls, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function OrbMesh() {
  const meshRef = useRef(null);
  const glowRef = useRef(null);
  const { mouse } = useThree();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Subtle mouse parallax
    meshRef.current.rotation.y += 0.003 + mouse.x * 0.001;
    meshRef.current.rotation.x += mouse.y * 0.001;

    // Pulse glow scale
    const t = state.clock.getElapsedTime();
    const pulse = 1 + Math.sin(t * 1.2) * 0.04;
    if (glowRef.current) {
      glowRef.current.scale.setScalar(pulse);
    }
  });

  return (
    <group>
      {/* Outer glow orb */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[2.1, 32, 32]} />
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.06}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Main distorted sphere */}
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <icosahedronGeometry args={[1.6, 4]} />
        <MeshDistortMaterial
          color={hovered ? '#a78bfa' : '#7c3aed'}
          emissive={hovered ? '#4c1d95' : '#2e1065'}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.7}
          distort={0.3}
          speed={1.5}
          transparent
          opacity={0.92}
        />
      </mesh>

      {/* Inner wireframe shell */}
      <mesh>
        <icosahedronGeometry args={[1.62, 1]} />
        <meshBasicMaterial
          color="#c4b5fd"
          wireframe
          transparent
          opacity={0.08}
        />
      </mesh>
    </group>
  );
}

export default function FloatingOrb() {
  return (
    <>
      <ambientLight intensity={0.4} color="#ffffff" />
      <directionalLight position={[4, 6, 4]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-3, -2, -3]} intensity={2} color="#7c3aed" />
      <pointLight position={[3, 3, 2]} intensity={0.8} color="#c4b5fd" />

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.07}
        rotateSpeed={0.3}
      />

      <Float speed={1.8} rotationIntensity={0.3} floatIntensity={0.8}>
        <OrbMesh />
      </Float>
    </>
  );
}
