import * as THREE from "three";

const year = document.getElementById("year");
if (year) year.textContent = String(new Date().getFullYear());

/* ---------- UI ---------- */
const header = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const mobileNav = document.querySelector(".mobile-nav");

const onScrollUI = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
};
onScrollUI();
window.addEventListener("scroll", onScrollUI, { passive: true });

const closeMenu = () => {
  if (!menuToggle || !mobileNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open menu");
  mobileNav.hidden = true;
  document.body.style.overflow = "";
};

const openMenu = () => {
  if (!menuToggle || !mobileNav) return;
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Close menu");
  mobileNav.hidden = false;
  document.body.style.overflow = "hidden";
};

menuToggle?.addEventListener("click", () => {
  const open = menuToggle.getAttribute("aria-expanded") === "true";
  if (open) closeMenu();
  else openMenu();
});

mobileNav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMenu();
});
window.addEventListener("resize", () => {
  if (window.matchMedia("(min-width: 768px)").matches) closeMenu();
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealEls = document.querySelectorAll(".reveal, .glass, .job.glass, .project.glass");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealEls.forEach((el) => el.classList.add("is-visible"));
} else {
  document.querySelectorAll(".hero .reveal").forEach((el) => {
    requestAnimationFrame(() => el.classList.add("is-visible"));
  });
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
  );
  revealEls.forEach((el) => {
    if (el.closest(".hero")) return;
    io.observe(el);
  });
}

/* ---------- Three.js scene ---------- */
const canvas = document.getElementById("webgl");
if (!canvas) throw new Error("Missing #webgl canvas");

const isMobile = window.matchMedia("(max-width: 768px)").matches;
const particleCount = isMobile ? 900 : 2200;

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: !isMobile,
  alpha: true,
  powerPreference: "high-performance",
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x07090d, 1);
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x07090d, 0.045);

const camera = new THREE.PerspectiveCamera(48, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 0.2, 6.2);

const group = new THREE.Group();
scene.add(group);

const accent = new THREE.Color(0xff6a1a);
const teal = new THREE.Color(0x3dd6c6);
const mist = new THREE.Color(0x9eb6d4);

// Soft lights
scene.add(new THREE.AmbientLight(0xffffff, 0.35));
const key = new THREE.DirectionalLight(0xffc9a8, 1.1);
key.position.set(4, 6, 5);
scene.add(key);
const fill = new THREE.PointLight(0x3dd6c6, 1.4, 20);
fill.position.set(-4, -1, 3);
scene.add(fill);
const rim = new THREE.PointLight(0xff6a1a, 1.2, 18);
rim.position.set(3, 2, -2);
scene.add(rim);

// Core sculpture — interlocking wire + solid forms
const core = new THREE.Group();
group.add(core);

const torus = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.05, 0.28, isMobile ? 100 : 180, isMobile ? 12 : 24),
  new THREE.MeshStandardMaterial({
    color: 0x121722,
    metalness: 0.85,
    roughness: 0.28,
    emissive: 0x1a120c,
    emissiveIntensity: 0.35,
  })
);
core.add(torus);

const wire = new THREE.LineSegments(
  new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.85, 1)),
  new THREE.LineBasicMaterial({ color: 0x3dd6c6, transparent: true, opacity: 0.28 })
);
core.add(wire);

const ring = new THREE.Mesh(
  new THREE.TorusGeometry(2.35, 0.015, 16, isMobile ? 80 : 160),
  new THREE.MeshBasicMaterial({ color: 0xff6a1a, transparent: true, opacity: 0.55 })
);
ring.rotation.x = Math.PI / 2.4;
core.add(ring);

const ring2 = ring.clone();
ring2.scale.setScalar(1.18);
ring2.material = new THREE.MeshBasicMaterial({ color: 0x3dd6c6, transparent: true, opacity: 0.25 });
ring2.rotation.x = Math.PI / 3.2;
ring2.rotation.y = 0.4;
core.add(ring2);

// Floating orbs
const orbs = [];
for (let i = 0; i < (isMobile ? 5 : 8); i++) {
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.06 + Math.random() * 0.08, 16, 16),
    new THREE.MeshStandardMaterial({
      color: i % 2 ? 0xff6a1a : 0x3dd6c6,
      emissive: i % 2 ? 0xff6a1a : 0x3dd6c6,
      emissiveIntensity: 0.7,
      metalness: 0.4,
      roughness: 0.25,
    })
  );
  const angle = (i / 8) * Math.PI * 2;
  const radius = 2.2 + Math.random() * 0.8;
  orb.userData = {
    angle,
    radius,
    speed: 0.15 + Math.random() * 0.25,
    y: (Math.random() - 0.5) * 1.8,
  };
  orb.position.set(Math.cos(angle) * radius, orb.userData.y, Math.sin(angle) * radius);
  core.add(orb);
  orbs.push(orb);
}

// Particle field
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);
const colorPool = [accent, teal, mist];

for (let i = 0; i < particleCount; i++) {
  const i3 = i * 3;
  const r = 4 + Math.random() * 10;
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  positions[i3] = r * Math.sin(phi) * Math.cos(theta);
  positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.65;
  positions[i3 + 2] = r * Math.cos(phi);
  const c = colorPool[i % colorPool.length];
  colors[i3] = c.r;
  colors[i3 + 1] = c.g;
  colors[i3 + 2] = c.b;
}

const particlesGeo = new THREE.BufferGeometry();
particlesGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
particlesGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

const particles = new THREE.Points(
  particlesGeo,
  new THREE.PointsMaterial({
    size: isMobile ? 0.025 : 0.018,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })
);
group.add(particles);

// Pointer / scroll state
const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
const onPointer = (e) => {
  const x = e.touches ? e.touches[0].clientX : e.clientX;
  const y = e.touches ? e.touches[0].clientY : e.clientY;
  pointer.tx = (x / window.innerWidth) * 2 - 1;
  pointer.ty = -(y / window.innerHeight) * 2 + 1;
};

window.addEventListener("pointermove", onPointer, { passive: true });
window.addEventListener("touchmove", onPointer, { passive: true });

let scrollY = 0;
const onScrollScene = () => {
  scrollY = window.scrollY;
};
window.addEventListener("scroll", onScrollScene, { passive: true });

const onResize = () => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
};
window.addEventListener("resize", onResize);

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  const maxScroll = Math.max(document.body.scrollHeight - window.innerHeight, 1);
  const scrollProgress = scrollY / maxScroll;

  pointer.x += (pointer.tx - pointer.x) * 0.05;
  pointer.y += (pointer.ty - pointer.y) * 0.05;

  if (!reduceMotion) {
    core.rotation.y = t * 0.18 + pointer.x * 0.35;
    core.rotation.x = 0.25 + Math.sin(t * 0.2) * 0.08 + pointer.y * 0.2;
    wire.rotation.y = -t * 0.12;
    wire.rotation.z = t * 0.05;
    ring.rotation.z = t * 0.25;
    ring2.rotation.z = -t * 0.18;

    orbs.forEach((orb) => {
      const d = orb.userData;
      d.angle += d.speed * 0.01;
      orb.position.x = Math.cos(d.angle) * d.radius;
      orb.position.z = Math.sin(d.angle) * d.radius;
      orb.position.y = d.y + Math.sin(t * 0.8 + d.angle) * 0.2;
    });

    particles.rotation.y = t * 0.02 + scrollProgress * 0.6;
    particles.rotation.x = scrollProgress * 0.35;

    group.position.y = -scrollProgress * 2.2;
    group.rotation.z = scrollProgress * 0.15;

    camera.position.x = pointer.x * 0.45;
    camera.position.y = 0.2 + pointer.y * 0.25 - scrollProgress * 0.4;
    camera.lookAt(0, -scrollProgress * 0.5, 0);

    fill.intensity = 1.2 + Math.sin(t * 1.4) * 0.25;
    rim.intensity = 1.0 + Math.cos(t * 1.1) * 0.3;
  }

  renderer.render(scene, camera);
}

animate();
