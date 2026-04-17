// BASIC SETUP
const canvas = document.getElementById("game");
const scene = new THREE.Scene();

// Fog
scene.fog = new THREE.Fog(0x87ceeb, 20, 150);

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(0, 5, 10);

// Renderer
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// LIGHTING
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 7);
scene.add(dirLight);

// ROAD
const roadGroup = new THREE.Group();
scene.add(roadGroup);

const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });

function createRoadSegment(z) {
  const geometry = new THREE.PlaneGeometry(10, 50);
  const mesh = new THREE.Mesh(geometry, roadMaterial);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.z = z;
  roadGroup.add(mesh);

  // Lane markings
  const lineGeo = new THREE.PlaneGeometry(0.2, 50);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

  const line = new THREE.Mesh(lineGeo, lineMat);
  line.rotation.x = -Math.PI / 2;
  line.position.z = z;
  scene.add(line);
}

// Create initial road
for (let i = 0; i < 10; i++) {
  createRoadSegment(-i * 50);
}

// CAR
const car = new THREE.Group();

const body = new THREE.Mesh(
  new THREE.BoxGeometry(1.5, 0.6, 3),
  new THREE.MeshStandardMaterial({ color: 0xff3333 })
);
body.position.y = 0.5;

car.add(body);
scene.add(car);

// MOVEMENT
let speed = 0.5;
let steer = 0;
let targetSteer = 0;

// KEYBOARD
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") targetSteer = -1;
  if (e.key === "ArrowRight" || e.key === "d") targetSteer = 1;
});

document.addEventListener("keyup", () => {
  targetSteer = 0;
});

// MOBILE STEERING
const wheel = document.getElementById("steering-wheel");
let dragging = false;

wheel.addEventListener("touchstart", () => dragging = true);

wheel.addEventListener("touchmove", (e) => {
  if (!dragging) return;

  const touch = e.touches[0];
  const rect = wheel.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;

  const delta = (touch.clientX - centerX) / (rect.width / 2);
  targetSteer = THREE.MathUtils.clamp(delta, -1, 1);
});

wheel.addEventListener("touchend", () => {
  dragging = false;
  targetSteer = 0;
});

// DISTANCE
let distance = 0;
const distanceUI = document.getElementById("distance");

// DAY/NIGHT
let time = 0;

// ANIMATION LOOP
function animate() {
  requestAnimationFrame(animate);

  // Smooth steering
  steer += (targetSteer - steer) * 0.05;
  car.position.x += steer * 0.2;

  // Move forward
  car.position.z -= speed;
  distance += speed;
  distanceUI.innerText = Math.floor(distance) + " m";

  // Camera follow
  camera.position.x += (car.position.x - camera.position.x) * 0.05;
  camera.position.z += (car.position.z + 10 - camera.position.z) * 0.05;
  camera.lookAt(car.position);

  // Recycle road
  roadGroup.children.forEach((road) => {
    if (road.position.z > car.position.z + 50) {
      road.position.z -= 500;
    }
  });

  // Day/Night Cycle
  time += 0.002;
  const t = (Math.sin(time) + 1) / 2;

  const skyColor = new THREE.Color().lerpColors(
    new THREE.Color(0x000022),
    new THREE.Color(0x87ceeb),
    t
  );

  renderer.setClearColor(skyColor);
  scene.fog.color = skyColor;

  renderer.render(scene, camera);
}

// RESIZE
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
