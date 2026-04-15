import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Preload } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

const ANIMATION_PHASES = {
  INTACT: 0,
  SPLIT: 1,
  FLOATING: 2,
  MERGE: 3,
};

const PHASE_DURATION = 0.25;
const FLOAT_DURATION = 0.3;
const MERGE_DURATION = 0.25;
const CYCLE_TIME = PHASE_DURATION + FLOAT_DURATION + MERGE_DURATION;

// ===== CORE LIQUID MESH =====
const LiquidCoreMesh = React.memo(({ segments = 5 }) => {
  const meshRefs = useRef([]);
  const clockRef = useRef(new THREE.Clock());
  const groupRef = useRef(null);

  const segmentMeshes = useMemo(() => {
    return Array.from({ length: segments }).map(() => ({
      position: new THREE.Vector3(),
      targetPosition: new THREE.Vector3(),
      velocity: new THREE.Vector3(),
      scale: new THREE.Vector3(1, 1, 1),
      rotation: new THREE.Euler(),
    }));
  }, [segments]);

  // Create main torus with deformation
  const createMainGeometry = useCallback(() => {
    const geometry = new THREE.TorusGeometry(1.2, 0.5, 64, 100);
    const positions = geometry.attributes.position;
    const posArray = positions.array;

    for (let i = 0; i < posArray.length; i += 3) {
      const x = posArray[i];
      const y = posArray[i + 1];
      const z = posArray[i + 2];
      const dist = Math.sqrt(x * x + y * y + z * z);
      const noise = Math.sin(dist * 3) * 0.08;
      posArray[i] += (x / dist) * noise;
      posArray[i + 1] += (y / dist) * noise;
      posArray[i + 2] += (z / dist) * noise;
    }
    positions.needsUpdate = true;
    return geometry;
  }, []);

  const geometry = useMemo(() => createMainGeometry(), [createMainGeometry]);

  // Liquid metal material
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color('#f5f5f5'),
        metalness: 1.0,
        roughness: 0.2,
        clearcoat: 1,
        clearcoatRoughness: 0.15,
        reflectivity: 1,
        envMapIntensity: 1.5,
        side: THREE.DoubleSide,
      }),
    []
  );

  // Wireframe material
  const wireframeMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#c0c0c0'),
        transparent: true,
        opacity: 0.3,
        wireframe: true,
      }),
    []
  );

  // Particle system
  const createParticleSystem = useCallback(() => {
    const particleCount = 200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.userData.velocities = velocities;

    const mat = new THREE.PointsMaterial({
      color: new THREE.Color('#e8e8e8'),
      size: 0.04,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });

    return new THREE.Points(geo, mat);
  }, []);

  const particleSystem = useMemo(() => createParticleSystem(), [createParticleSystem]);

  // Create flowing lines
  const createFlowingLines = useCallback(() => {
    const lines = [];
    for (let i = 0; i < 3; i++) {
      const curve = new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 1.5, 0),
        new THREE.Vector3(1.5, 0.5, 0.5),
        new THREE.Vector3(0.5, -1.5, 1),
        new THREE.Vector3(-1.5, 0, -0.5),
      ]);

      const geo = new THREE.TubeGeometry(curve, 20, 0.06, 8, false);
      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color('#b0b0b0'),
        metalness: 0.9,
        roughness: 0.3,
        emissive: new THREE.Color('#3a3a3a'),
        transparent: true,
        opacity: 0.25,
      });

      const tube = new THREE.Mesh(geo, mat);
      lines.push({ mesh: tube, angle: (i / 3) * Math.PI * 2, speed: 0.3 + i * 0.1 });
    }
    return lines;
  }, []);

  const flowingLines = useMemo(() => createFlowingLines(), [createFlowingLines]);

  // Get phase and time within phase
  const getPhase = useCallback((elapsed) => {
    const cyclePos = elapsed % CYCLE_TIME;
    if (cyclePos < PHASE_DURATION) return { phase: ANIMATION_PHASES.SPLIT, t: cyclePos / PHASE_DURATION };
    if (cyclePos < PHASE_DURATION + FLOAT_DURATION) return { phase: ANIMATION_PHASES.FLOATING, t: (cyclePos - PHASE_DURATION) / FLOAT_DURATION };
    return { phase: ANIMATION_PHASES.MERGE, t: (cyclePos - PHASE_DURATION - FLOAT_DURATION) / MERGE_DURATION };
  }, []);

  // Easing functions
  const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOutQuad = (t) => 1 - (1 - t) * (1 - t);

  useFrame(() => {
    const elapsed = clockRef.current.getElapsedTime();
    const { phase, t } = getPhase(elapsed);

    // ===== SEGMENT ANIMATION =====
    segmentMeshes.forEach((segment, idx) => {
      const angle = (idx / segments) * Math.PI * 2;
      const offsetRadius = 0.8;

      if (phase === ANIMATION_PHASES.SPLIT) {
        const easedT = easeInOutCubic(t);
        segment.targetPosition.set(Math.cos(angle) * offsetRadius * easedT, Math.sin(angle * 0.5) * offsetRadius * easedT, Math.sin(angle) * offsetRadius * easedT * 0.5);
      } else if (phase === ANIMATION_PHASES.FLOATING) {
        const orbitT = t * Math.PI * 2;
        const orbit = 0.3;
        segment.targetPosition.set(Math.cos(angle + orbitT) * orbit, Math.sin(angle + orbitT * 0.5) * orbit, Math.sin(angle + orbitT) * orbit * 0.3);
      } else if (phase === ANIMATION_PHASES.MERGE) {
        const easedT = easeOutQuad(1 - t);
        segment.targetPosition.set(Math.cos(angle) * offsetRadius * easedT, Math.sin(angle * 0.5) * offsetRadius * easedT, Math.sin(angle) * offsetRadius * easedT * 0.5);
      }

      // Smooth lerp
      segment.position.lerp(segment.targetPosition, 0.12);

      if (meshRefs.current[idx]) {
        meshRefs.current[idx].position.copy(segment.position);
        meshRefs.current[idx].rotation.x += 0.005 + idx * 0.002;
        meshRefs.current[idx].rotation.y += 0.008 + idx * 0.001;
      }
    });

    // ===== PARTICLE ANIMATION =====
    if (particleSystem && particleSystem.geometry) {
      const positions = particleSystem.geometry.attributes.position.array;
      const velocities = particleSystem.geometry.userData.velocities;
      const phaseInfluence = phase === ANIMATION_PHASES.FLOATING ? 1.2 : 0.8;

      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += velocities[i] * phaseInfluence;
        positions[i + 1] += velocities[i + 1] * phaseInfluence;
        positions[i + 2] += velocities[i + 2] * phaseInfluence;

        if (Math.abs(positions[i]) > 2) positions[i] *= -0.9;
        if (Math.abs(positions[i + 1]) > 2) positions[i + 1] *= -0.9;
        if (Math.abs(positions[i + 2]) > 2) positions[i + 2] *= -0.9;
      }
      particleSystem.geometry.attributes.position.needsUpdate = true;
    }

    // ===== FLOWING LINES =====
    flowingLines.forEach(({ mesh, angle, speed }) => {
      mesh.rotation.z += speed * 0.005;
      mesh.rotation.x = Math.sin(elapsed * 0.4 + angle) * 0.15;
    });

    // ===== GROUP BREATHING =====
    if (groupRef.current) {
      const breathe = 1 + Math.sin(elapsed * 1.2) * 0.05;
      groupRef.current.scale.set(breathe, breathe, breathe);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Main segments */}
      {segmentMeshes.map((_, idx) => (
        <group key={`segment-${idx}`} ref={(el) => (meshRefs.current[idx] = el)}>
          <mesh geometry={geometry} material={material} />
          <mesh geometry={geometry} material={wireframeMaterial} />
        </group>
      ))}

      {/* Flowing lines */}
      {flowingLines.map((line, idx) => (
        <primitive key={`line-${idx}`} object={line.mesh} />
      ))}

      {/* Particles */}
      <primitive object={particleSystem} />
    </group>
  );
});

LiquidCoreMesh.displayName = 'LiquidCoreMesh';

// ===== SCENE SETUP =====
const Scene = () => {
  const { scene } = useThree();

  // Lighting
  useEffect(() => {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const directional = new THREE.DirectionalLight(0xf5f5f5, 0.8);
    directional.position.set(5, 10, 7);
    directional.castShadow = true;
    directional.shadow.mapSize.width = 1024;
    directional.shadow.mapSize.height = 1024;
    scene.add(directional);

    const pointLight = new THREE.PointLight(0xe0e0e0, 0.6);
    pointLight.position.set(-5, 5, -5);
    scene.add(pointLight);

    return () => {
      scene.remove(ambientLight, directional, pointLight);
    };
  }, [scene]);

  return (
    <>
      <OrbitControls enableZoom={true} enablePan={true} autoRotate autoRotateSpeed={2} />
      <LiquidCoreMesh segments={5} />
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        <Vignette eskil={false} offset={0.15} darkness={0.5} />
      </EffectComposer>
      <Preload all />
    </>
  );
};

// ===== MAIN COMPONENT =====
export default function HeroAnimation({ embedded = false }) {
  // Add error boundary
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return <div style={{ width: '100%', height: embedded ? '100%' : '100vh', background: 'transparent' }} />;
  }

  try {
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
          overflow: 'hidden'
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          gl={{
            antialias: true,
            alpha: true,
            pixelRatio: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1,
            preserveDrawingBuffer: true
          }}
          dpr={[1, 2]}
          frameloop="always"
          onError={(error) => {
            console.error('Canvas error:', error);
            setHasError(true);
          }}
        >
          <Scene />
        </Canvas>
      </div>
    );
  } catch (error) {
    console.error('HeroAnimation render error:', error);
    setHasError(true);
    return <div style={{ width: '100%', height: embedded ? '100%' : '100vh', background: 'transparent' }} />;
  }
}
