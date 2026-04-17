import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

// ===== BASIC =====
const canvas = document.getElementById("game");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 30, 300);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, 12);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// ===== LIGHT =====
scene.add(new THREE.AmbientLight(0xffffff, 0.7));

const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(20, 30, 10);
scene.add(sun);

// ===== TERRAIN =====
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(500, 500),
  new THREE.MeshStandardMaterial({ color: 0x2d5a27 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ===== ROAD SYSTEM =====
const roadGroup = new THREE.Group();
scene.add(roadGroup);

const roadMat = new THREE.MeshStandardMaterial({ color: 0x222222 });

let roadSegments = [];
let segmentLength = 20;
let roadWidth = 6;

let currentCurve = 0;
let curveTarget = 0;

// generate curved road
function createSegment(index) {
  const geo = new THREE.PlaneGeometry(roadWidth, segmentLength, 1, 10);

  // curve deformation
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let z = pos.getZ(i);

    x += Math.sin(z * 0.1 + index * 0.5) * currentCurve;
    pos.setX(i, x);
  }

  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, roadMat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.z = -index * segmentLength;

  roadGroup.add(mesh);
  roadSegments.push(mesh);
}

// init road
for (let i = 0; i < 30; i++) {
  createSegment(i);
}

// ===== CAR =====
const car = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.BoxGeometry(1.6, 0.6, 3),
  new THREE.MeshStandardMaterial({ color: 0xff4444, metalness: 0.4, roughness: 0.5 })
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

document.addEventListener("keyup", () => targetSteer = 0);

// mobile
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
let speed = 0.5;
let distance = 0;
const distanceUI = document.getElementById("distance");

let time = 0;

// ===== LOOP =====
function animate() {
  requestAnimationFrame(animate);

  // smooth steering
  steer += (targetSteer - steer) * 0.06;

  // realistic movement
  car.position.x += steer * 0.2;
  car.rotation.z = -steer * 0.2;

  // forward
  car.position.z -= speed;
  distance += speed;
  distanceUI.innerText = Math.floor(distance) + " m";

  // camera follow
  camera.position.x += (car.position.x - camera.position.x) * 0.05;
  camera.position.y += (6 - camera.position.y) * 0.05;
  camera.position.z += (car.position.z + 12 - camera.position.z) * 0.05;

  camera.lookAt(car.position);

  // curve change slowly
  curveTarget += (Math.random() - 0.5) * 0.01;
  curveTarget = THREE.MathUtils.clamp(curveTarget, -1.5, 1.5);
  currentCurve += (curveTarget - currentCurve) * 0.01;

  // recycle segments
  roadSegments.forEach((seg) => {
    if (seg.position.z > car.position.z + 40) {
      seg.position.z -= segmentLength * roadSegments.length;
    }
  });

  // sky cycle
  time += 0.0015;
  const t = (Math.sin(time) + 1) / 2;

  const sky = new THREE.Color().lerpColors(
    new THREE.Color(0x0a0a1f),
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

animate();
