import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

// ===== SETUP =====
const canvas = document.getElementById("game");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 50, 400);

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

// ===== TERRAIN (FIXED LOOPING) =====
const groundGroup = new THREE.Group();
scene.add(groundGroup);

const groundMat = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });

const groundSize = 200;

for (let i = 0; i < 6; i++) {
  const g = new THREE.Mesh(
    new THREE.PlaneGeometry(groundSize, groundSize),
    groundMat
  );
  g.rotation.x = -Math.PI / 2;
  g.position.z = -i * groundSize;
  groundGroup.add(g);
}

// ===== ROAD =====
const roadGroup = new THREE.Group();
scene.add(roadGroup);

const roadMat = new THREE.MeshStandardMaterial({ color: 0x222222 });

let segments = [];
const segmentLength = 20;
const roadWidth = 6;

let curve = 0;
let curveTarget = 0;

function createSegment(i) {
  const geo = new THREE.PlaneGeometry(roadWidth, segmentLength, 1, 10);

  const pos = geo.attributes.position;
  for (let j = 0; j < pos.count; j++) {
    let x = pos.getX(j);
    let z = pos.getZ(j);

    x += Math.sin(z * 0.1 + i * 0.5) * curve;
    pos.setX(j, x);
  }

  geo.computeVertexNormals();

  const mesh = new THREE.Mesh(geo, roadMat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.z = -i * segmentLength;

  // lane marking (NO FLICKER FIX)
  const line = new THREE.Mesh(
    new THREE.PlaneGeometry(0.15, segmentLength),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  line.rotation.x = -Math.PI / 2;
  line.position.y = 0.02; // <-- FIX: lifted to prevent z-fighting
  mesh.add(line);

  roadGroup.add(mesh);
  segments.push(mesh);
}

// init
for (let i = 0; i < 40; i++) {
  createSegment(i);
}

// ===== CAR =====
const car = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.BoxGeometry(1.6, 0.6, 3),
  new THREE.MeshStandardMaterial({ color: 0xff4444 })
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

  // steering
  steer += (targetSteer - steer) * 0.06;
  car.position.x += steer * 0.2;
  car.rotation.z = -steer * 0.2;

  // forward
  car.position.z -= speed;
  distance += speed;
  distanceUI.innerText = Math.floor(distance) + " m";

  // camera
  camera.position.x += (car.position.x - camera.position.x) * 0.05;
  camera.position.z += (car.position.z + 12 - camera.position.z) * 0.05;
  camera.lookAt(car.position);

  // smooth curve
  curveTarget += (Math.random() - 0.5) * 0.01;
  curveTarget = THREE.MathUtils.clamp(curveTarget, -1.2, 1.2);
  curve += (curveTarget - curve) * 0.01;

  // recycle road
  segments.forEach((seg) => {
    if (seg.position.z > car.position.z + 40) {
      seg.position.z -= segmentLength * segments.length;
    }
  });

  // recycle ground (FIX disappearance)
  groundGroup.children.forEach((g) => {
    if (g.position.z > car.position.z + groundSize) {
      g.position.z -= groundSize * groundGroup.children.length;
    }
  });

  // sky
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

// resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
