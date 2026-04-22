import { Canvas, useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useRef, useMemo } from "react";
import * as THREE from "three";

/* ---------------- GLSL LIQUID DISTORTION ---------------- */

const vertexShader = `
uniform float uTime;
varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 pos = position;

  float wave = sin(pos.y * 4.0 + uTime * 2.0) * 0.05;
  pos.z += wave;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  uv.x += sin(uv.y * 5.0 + uTime) * 0.02;
  uv.y += cos(uv.x * 5.0 + uTime) * 0.02;

  vec4 color = texture2D(uTexture, uv);

  gl_FragColor = color;
}
`;

/* ---------------- PARTICLES (ENERGY FIELD) ---------------- */

function Particles() {
  const ref = useRef();

  const count = 500;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      arr[i] = (Math.random() - 0.5) * 10;
    }
    return arr;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.05;
    ref.current.rotation.x = Math.sin(t * 0.2) * 0.3;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} color="#9B5DE5" />
    </points>
  );
}

/* ---------------- LOGO CORE ---------------- */

function LogoCore() {
  const texture = useTexture("/oregent-logo.png");
  const group = useRef();
  const meshes = useRef([]);

  const layers = 10;
  const duration = 20;

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();
    const phase = (t % duration) / duration;

    const ease = (x) => x * x * (3 - 2 * x);

    // cinematic motion
    group.current.rotation.y += delta * 0.1;
    group.current.rotation.x = Math.sin(t * 0.2) * 0.2;

    group.current.position.y = Math.sin(t * 0.5) * 0.15;

    meshes.current.forEach((mesh, i) => {
      if (!mesh) return;

      let split = 0;

      if (phase < 0.25) split = 0;
      else if (phase < 0.5) split = ease((phase - 0.25) / 0.25);
      else if (phase < 0.75) split = 1;
      else split = 1 - ease((phase - 0.75) / 0.25);

      const angle = (i / layers) * Math.PI * 2;

      const spread = split * 1.5;

      mesh.position.x = Math.cos(angle) * spread;
      mesh.position.y = Math.sin(angle) * spread;
      mesh.position.z = i * 0.08 + split * 1;

      mesh.rotation.z = split * 1 + i * 0.1;

      // update shader time
      mesh.material.uniforms.uTime.value = t;
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: layers }).map((_, i) => (
        <mesh key={i} ref={(el) => (meshes.current[i] = el)}>
          <planeGeometry args={[2, 2]} />
          <shaderMaterial
            uniforms={{
              uTime: { value: 0 },
              uTexture: { value: texture },
            }}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            transparent
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------------- CAMERA SYSTEM ---------------- */

function CameraRig() {
  const ref = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    ref.current.position.z = 5 + Math.sin(t * 0.3) * 0.3;
    ref.current.position.x = state.mouse.x * 0.5;
    ref.current.position.y = state.mouse.y * 0.3;

    ref.current.lookAt(0, 0, 0);
  });

  return <perspectiveCamera ref={ref} makeDefault position={[0, 0, 5]} />;
}

/* ---------------- MAIN ---------------- */

export default function HeroAnimation() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Canvas>
        {/* Background */}
        <color attach="background" args={["#030303"]} />

        {/* CAMERA */}
        <CameraRig />

        {/* LIGHTING */}
        <ambientLight intensity={0.2} />

        <directionalLight position={[3, 3, 3]} intensity={1.2} />

        <pointLight position={[0, 0, 3]} intensity={3} color="#A259FF" />

        {/* OBJECTS */}
        <Particles />
        <LogoCore />

        {/* POST FX */}
        <EffectComposer>
          <Bloom intensity={2} luminanceThreshold={0.1} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}