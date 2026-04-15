import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function OreHackHero() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const W = mount.clientWidth;
    const H = mount.clientHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8;
    mount.appendChild(renderer.domElement);

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.set(0, 0, 5);

    // Material — dark metallic
    const mat = (roughness = 0.3) =>
      new THREE.MeshStandardMaterial({
        color: 0x111111,
        metalness: 0.95,
        roughness,
        envMapIntensity: 1.2,
      });

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.15);
    scene.add(ambient);

    const rim1 = new THREE.PointLight(0x8855ff, 4, 20);
    rim1.position.set(-3, 2, 3);
    scene.add(rim1);

    const rim2 = new THREE.PointLight(0x334466, 3, 15);
    rim2.position.set(3, -2, 2);
    scene.add(rim2);

    const top = new THREE.DirectionalLight(0xaaaacc, 0.8);
    top.position.set(0, 5, 5);
    scene.add(top);

    // Rings group
    const rings = [];

    const ringDefs = [
      // [radius, tube, tiltX, tiltY, tiltZ, speedX, speedY, speedZ, roughness]
      [2.8, 0.055, 0.4, 0.0, 0.0, 0.003, 0.0, 0.001, 0.2],
      [2.4, 0.045, 0.0, 0.3, 0.5, 0.0, 0.004, 0.002, 0.3],
      [2.0, 0.06, 1.0, 0.2, 0.1, -0.005, 0.001, 0.003, 0.25],
      [1.6, 0.04, 0.5, 1.1, 0.3, 0.002, -0.006, 0.001, 0.35],
      [1.3, 0.05, 0.2, 0.5, 0.9, 0.006, 0.003, -0.004, 0.2],
      [1.0, 0.035, 0.8, 0.1, 0.4, -0.003, 0.007, 0.002, 0.3],
      [0.7, 0.03, 0.3, 0.9, 0.2, 0.008, -0.002, 0.005, 0.4],
    ];

    ringDefs.forEach(([r, tube, rx, ry, rz, sx, sy, sz, rough]) => {
      const geo = new THREE.TorusGeometry(r, tube, 80, 200);
      const mesh = new THREE.Mesh(geo, mat(rough));
      mesh.rotation.set(rx, ry, rz);
      mesh.userData = { sx, sy, sz };
      scene.add(mesh);
      rings.push(mesh);
    });

    // Particles / stars
    const pCount = 300;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) {
      pPos[i] = (Math.random() - 0.5) * 14;
    }
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x8877cc,
      size: 0.025,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // Animate
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      rings.forEach((ring) => {
        const { sx, sy, sz } = ring.userData;
        ring.rotation.x += sx;
        ring.rotation.y += sy;
        ring.rotation.z += sz;
      });

      particles.rotation.y = t * 0.02;

      // Subtle camera drift
      camera.position.x = Math.sin(t * 0.15) * 0.3;
      camera.position.y = Math.cos(t * 0.1) * 0.2;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      mount.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  return (
    <section style={styles.section}>
      {/* Three.js canvas */}
      <div ref={mountRef} style={styles.canvas} />

      {/* Vignette */}
      <div style={styles.vignette} />

      {/* Nav */}
      <nav style={styles.nav}>
        <div style={styles.logo}>
          <span style={styles.logoOre}>Ore</span>
          <span style={styles.logoHack}>hack</span>
          <span style={styles.logoBy}> by Oregent</span>
        </div>
        <div style={styles.navLinks}>
          {["Live Hackathons", "How it Works", "About Oregent", "Contact"].map((l) => (
            <a key={l} style={styles.navLink} href="#">
              {l}
            </a>
          ))}
        </div>
      </nav>

      {/* Hero content */}
      <div style={styles.content}>
        <h1 style={styles.title}>OREHACK</h1>
        <p style={styles.sub}>A Controlled Technical Evaluation System.</p>
        <p style={styles.desc}>
          Engineered by Oregent to process and validate competitive builds through
          <br />
          structured intelligence.
        </p>
        <button style={styles.btn}>
          View Active Hackathons &nbsp;&#x2335;
        </button>
      </div>
    </section>
  );
}

const styles = {
  section: {
    position: "relative",
    width: "100%",
    height: "100vh",
    background: "#000",
    overflow: "hidden",
    fontFamily: "'Courier New', monospace",
  },
  canvas: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
  },
  vignette: {
    position: "absolute",
    inset: 0,
    background:
      "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)",
    pointerEvents: "none",
  },
  nav: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 36px",
    zIndex: 10,
  },
  logo: {
    fontSize: "14px",
    letterSpacing: "0.5px",
  },
  logoOre: { color: "#fff", fontWeight: 700 },
  logoHack: { color: "#8855ff", fontWeight: 700 },
  logoBy: { color: "#555", fontSize: "11px" },
  navLinks: {
    display: "flex",
    gap: "28px",
  },
  navLink: {
    color: "#aaa",
    textDecoration: "none",
    fontSize: "12px",
    letterSpacing: "0.5px",
    transition: "color 0.2s",
    cursor: "pointer",
  },
  content: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    zIndex: 10,
    pointerEvents: "none",
  },
  title: {
    fontSize: "clamp(42px, 7vw, 80px)",
    fontWeight: 900,
    color: "#ffffff",
    letterSpacing: "6px",
    fontFamily: "'Courier New', monospace",
    margin: "0 0 12px",
    textShadow: "0 0 40px rgba(136,85,255,0.3)",
    // Pixel/chunky look
    imageRendering: "pixelated",
  },
  sub: {
    color: "#cccccc",
    fontSize: "14px",
    letterSpacing: "2px",
    margin: "0 0 12px",
    fontFamily: "Georgia, serif",
    fontStyle: "italic",
  },
  desc: {
    color: "#666",
    fontSize: "12px",
    lineHeight: 1.7,
    margin: "0 0 32px",
    letterSpacing: "0.5px",
  },
  btn: {
    pointerEvents: "all",
    background: "#7733ee",
    color: "#fff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "4px",
    fontSize: "12px",
    letterSpacing: "1px",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.2s, transform 0.2s",
  },
};