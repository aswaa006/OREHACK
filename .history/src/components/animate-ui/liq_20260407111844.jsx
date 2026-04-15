import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { useRef, useMemo, Component } from "react";
import * as THREE from "three";

/* =========================================================
   GLSL — Liquid distortion vertex/fragment shaders
   ========================================================= */

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uSplit;
varying vec2 vUv;
varying float vWave;

void main() {
  vUv = uv;
  vec3 pos = position;

  float wave1 = sin(pos.y * 6.0 + uTime * 2.5) * 0.04;
  float wave2 = cos(pos.x * 5.0 + uTime * 1.8) * 0.03;
  float wave3 = sin((pos.x + pos.y) * 4.0 + uTime * 3.0) * 0.02;

  pos.z += wave1 + wave2 + wave3;
  vWave = wave1 + wave2;

  float bulge = uSplit * 0.15 * (1.0 - length(uv - 0.5) * 2.0);
  pos.z += bulge;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D uTexture;
uniform float uTime;
uniform float uSplit;
uniform vec3 uTint;
uniform float uOpacity;
varying vec2 vUv;
varying float vWave;

void main() {
  vec2 uv = vUv;

  float distortStrength = 0.025 + uSplit * 0.015;
  uv.x += sin(uv.y * 8.0 + uTime * 1.5) * distortStrength;
  uv.y += cos(uv.x * 6.0 + uTime * 1.2) * distortStrength;

  vec4 tex = texture2D(uTexture, uv);

  // Invert: dark outlines become bright on dark bg
  float lum = 1.0 - (tex.r * 0.299 + tex.g * 0.587 + tex.b * 0.114);
  lum = smoothstep(0.05, 0.45, lum);

  vec3 color = uTint * lum;

  // edge glow
  float edgeGlow = smoothstep(0.02, 0.18, lum) * (1.0 - smoothstep(0.18, 0.5, lum));
  color += uTint * edgeGlow * 0.8;

  // wave iridescence
  color += vec3(0.1, 0.05, 0.2) * vWave * 3.0;

  float alpha = smoothstep(0.02, 0.15, lum) * uOpacity;

  gl_FragColor = vec4(color, alpha);
}
`;

/* =========================================================
   PARTICLES — Orbiting energy field
   ========================================================= */

function Particles() {
  const ref = useRef();
  const count = 600;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 2.5 + Math.random() * 3.5;
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    return pos;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = t * 0.04;
    ref.current.rotation.x = Math.sin(t * 0.15) * 0.2;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        color="#A259FF"
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* =========================================================
   ENERGY RINGS — Orbiting rings around the core
   ========================================================= */

function EnergyRing({ radius, speed, tiltX, tiltZ, color }) {
  const ref = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = tiltX + Math.sin(t * speed * 0.5) * 0.1;
    ref.current.rotation.y = t * speed;
    ref.current.rotation.z = tiltZ;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.008, 16, 100]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.25}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

/* =========================================================
   LOGO CORE — Multi-layer liquid-metal logo
   ========================================================= */

function LogoCore() {
  const texture = useTexture("/oregent-logo.png");
  const group = useRef();
  const meshes = useRef([]);

  const layers = 8;
  const duration = 20;

  const tints = useMemo(
    () => [
      new THREE.Color("#B266FF"),
      new THREE.Color("#A259FF"),
      new THREE.Color("#9B5DE5"),
      new THREE.Color("#8338EC"),
      new THREE.Color("#7B2FF7"),
      new THREE.Color("#6C63FF"),
      new THREE.Color("#5B8DEF"),
      new THREE.Color("#48BFE3"),
    ],
    []
  );

  const uniformSets = useMemo(
    () =>
      Array.from({ length: layers }, (_, i) => ({
        uTime: { value: 0 },
        uTexture: { value: texture },
        uSplit: { value: 0 },
        uTint: { value: tints[i] },
        uOpacity: { value: 1.0 - i * 0.06 },
      })),
    [texture, tints]
  );

  useFrame((state, delta) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    const phase = (t % duration) / duration;

    const ease = (x) => x * x * (3 - 2 * x);

    group.current.rotation.y += delta * 0.08;
    group.current.rotation.x = Math.sin(t * 0.15) * 0.15;
    group.current.position.y = Math.sin(t * 0.4) * 0.1;

    const breathe = 1.0 + Math.sin(t * 0.8) * 0.03;
    group.current.scale.setScalar(breathe);

    let split = 0;
    if (phase < 0.3) split = 0;
    else if (phase < 0.5) split = ease((phase - 0.3) / 0.2);
    else if (phase < 0.7) split = 1;
    else if (phase < 0.9) split = 1 - ease((phase - 0.7) / 0.2);
    else split = 0;

    meshes.current.forEach((mesh, i) => {
      if (!mesh) return;

      const angle = (i / layers) * Math.PI * 2;
      const spread = split * 1.2;

      mesh.position.x = Math.cos(angle + t * 0.3) * spread;
      mesh.position.y = Math.sin(angle + t * 0.3) * spread;
      mesh.position.z = (i - layers / 2) * 0.06 + split * Math.sin(angle) * 0.5;

      mesh.rotation.z = split * (Math.sin(t * 0.5 + i) * 0.3);

      const u = uniformSets[i];
      u.uTime.value = t;
      u.uSplit.value = split;
    });
  });

  return (
    <group ref={group}>
      {Array.from({ length: layers }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (meshes.current[i] = el)}
          renderOrder={i}
        >
          <planeGeometry args={[2.5, 2.5, 32, 32]} />
          <shaderMaterial
            uniforms={uniformSets[i]}
            vertexShader={vertexShader}
            fragmentShader={fragmentShader}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* =========================================================
   CAMERA RIG — Cinematic orbit with mouse parallax
   ========================================================= */

function CameraRig() {
  const { camera } = useThree();
  const targetPos = useRef(new THREE.Vector3(0, 0, 5));

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const mx = state.pointer.x;
    const my = state.pointer.y;

    targetPos.current.set(
      Math.sin(t * 0.1) * 0.5 + mx * 0.8,
      Math.cos(t * 0.08) * 0.3 + my * 0.5,
      5 + Math.sin(t * 0.2) * 0.4
    );

    camera.position.lerp(targetPos.current, 0.02);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* =========================================================
   AMBIENT GLOW — Soft volumetric sphere behind core
   ========================================================= */

function AmbientGlow() {
  const ref = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const pulse = 1.0 + Math.sin(t * 0.6) * 0.15;
    ref.current.scale.setScalar(pulse);
    ref.current.material.opacity = 0.06 + Math.sin(t * 0.8) * 0.02;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.5, 32, 32]} />
      <meshBasicMaterial
        color="#7B2FF7"
        transparent
        opacity={0.06}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.BackSide}
      />
    </mesh>
  );
}

/* =========================================================
   SCENE — All 3D objects composed together
   ========================================================= */

function Scene() {
  return (
    <>
      <color attach="background" args={["#030303"]} />
      <CameraRig />

      <ambientLight intensity={0.15} />
      <pointLight position={[0, 0, 3]} intensity={3} color="#A259FF" distance={10} decay={2} />
      <pointLight position={[-2, 1, 2]} intensity={1.5} color="#6C63FF" distance={8} decay={2} />
      <pointLight position={[2, -1, 1]} intensity={1} color="#48BFE3" distance={8} decay={2} />

      <AmbientGlow />
      <Particles />
      <LogoCore />

      <EnergyRing radius={2.8} speed={0.3} tiltX={0.5} tiltZ={0.2} color="#A259FF" />
      <EnergyRing radius={3.2} speed={-0.2} tiltX={-0.3} tiltZ={0.8} color="#6C63FF" />
      <EnergyRing radius={3.6} speed={0.15} tiltX={1.2} tiltZ={-0.3} color="#48BFE3" />
    </>
  );
}

/* =========================================================
   ERROR BOUNDARY — Prevents 3D crash from killing the page
   ========================================================= */

class CanvasErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(err, info) {
    console.warn("3D Canvas error caught:", err, info);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/* =========================================================
   MAIN EXPORT
   ========================================================= */

export default function HeroAnimation() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        inset: 0,
      }}
    >
      <CanvasErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 50 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: false,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.2;
          }}
        >
          <Scene />
        </Canvas>
      </CanvasErrorBoundary>
    </div>
  );
}