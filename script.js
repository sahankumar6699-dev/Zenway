import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

// ===== SAFE INIT (prevents black screen) =====
const canvas = document.getElementById("game");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 30, 200);

const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance"
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ===== LIGHT =====
scene.add(new THREE.AmbientLight(0xffffff, 0.7));

const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(10, 20, 10);
scene.add(sun);

// ===== ROAD =====
const roadGroup = new THREE.Group();
scene.add(roadGroup);

const roadMat = new THREE.MeshStandardMaterial({ color: 0x222222 });

function createRoad(z) {
  const geo = new THREE.PlaneGeometry(10, 60);
  const mesh = new THREE.Mesh(geo, roadMat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.z = z;
  roadGroup.add(mesh);

  // lane line
  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(0.2, 60),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  line.rotation.x = -Math.PI / 2;
  line.position.z = z;
  line.position.y = 0.01;
  roadGroup.add(line);
}

// generate road
for (let i = 0; i < 12; i++) {
  createRoad(-i * 60);
}

// ===== CAR =====
const car = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.BoxGeometry(1.6, 0.6, 3),
  new THREE.MeshStandardMaterial({ color: 0xff4444, metalness: 0.3, roughness: 0.6 })
);
body.position.y = 0.5;

car.add(body);
scene.add(car);

// ===== CONTROLS =====
let steer = 0;
let targetSteer = 0;

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") targetSteer = -1;
  if (e.key === "ArrowRight" || e.key === "d") targetSteer = 1;
});

document.addEventListener("keyup", () => {
  targetSteer = 0;
});

// MOBILE
const wheel = document.getElementById("steering-wheel");
let active = false;

wheel.addEventListener("touchstart", () => active = true);

wheel.addEventListener("touchmove", (e) => {
  if (!active) return;

  const touch = e.touches[0];
  const rect = wheel.getBoundingClientRect();
  const center = rect.left + rect.width / 2;

  let delta = (touch.clientX - center) / (rect.width / 2);
  targetSteer = THREE.MathUtils.clamp(delta, -1, 1);
});

wheel.addEventListener("touchend", () => {
  active = false;
  targetSteer = 0;
});

// ===== GAME =====
let speed = 0.6;
let distance = 0;
const distanceUI = document.getElementById("distance");

let time = 0;

// ===== LOOP =====
function animate() {
  requestAnimationFrame(animate);

  // smooth steering
  steer += (targetSteer - steer) * 0.08;
  car.position.x += steer * 0.25;

  // forward
  car.position.z -= speed;
  distance += speed;
  distanceUI.innerText = Math.floor(distance) + " m";

  // camera follow (smooth)
  camera.position.x += (car.position.x - camera.position.x) * 0.05;
  camera.position.z += (car.position.z + 10 - camera.position.z) * 0.05;
  camera.lookAt(car.position);

  // recycle road
  roadGroup.children.forEach((r) => {
    if (r.position.z > car.position.z + 60) {
      r.position.z -= 720;
    }
  });

  // day/night
  time += 0.002;
  const t = (Math.sin(time) + 1) / 2;

  const sky = new THREE.Color().lerpColors(
    new THREE.Color(0x000022),
    new THREE.Color(0x87ceeb),
    t
  );

  scene.background = sky;
  scene.fog.color = sky;

  renderer.render(scene, camera);
}

// ===== RESIZE =====
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== START =====
animate();
