const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 200);

//Touch steering update
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

const steering = document.getElementById("steering");

if (isTouchDevice) {
  steering.style.display = "block";
}

// Camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("game"),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);

const ambient = new THREE.AmbientLight(0x404040);
scene.add(ambient);

// Road
const roadGeometry = new THREE.PlaneGeometry(10, 200, 10, 50);
const roadMaterial = new THREE.MeshStandardMaterial({
  color: 0x222222
});
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
scene.add(road);

// Car (simple cube)
const carGeometry = new THREE.BoxGeometry(1, 0.5, 2);
const carMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const car = new THREE.Mesh(carGeometry, carMaterial);
car.position.y = 0.25;
scene.add(car);

// Camera position
camera.position.set(0, 2, 5);

// Controls
let speed = 0.2;
let moveLeft = false;
let moveRight = false;
let targetX = 0;

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") moveLeft = true;
  if (e.key === "ArrowRight" || e.key === "d") moveRight = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft" || e.key === "a") moveLeft = false;
  if (e.key === "ArrowRight" || e.key === "d") moveRight = false;
});

//Keyboard listeners 
const leftBtn = document.getElementById("leftBtn");
const rightBtn = document.getElementById("rightBtn");

//Steering Controls
let wheelAngle = 0;
let lastX = 0;

wheel.addEventListener("pointerdown", (e) => {
  steeringActive = true;
  lastX = e.clientX;
});

window.addEventListener("pointermove", (e) => {
  if (!steeringActive) return;

  let delta = e.clientX - lastX;

  // steering sensitivity
  targetX += delta * 0.01;

  // rotate wheel
  wheelAngle += delta * 0.5;
  wheel.style.transform = `rotate(${wheelAngle}deg)`;

  lastX = e.clientX;
});

window.addEventListener("pointerup", () => {
  steeringActive = false;
});

  window.addEventListener("pointerup", () => {
    steeringActive = false;
  });
}
// Distance
let distance = 0;

// Day/Night cycle
let time = 0;

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Movement
  if (moveLeft) targetX -= 0.15;
  if (moveRight) targetX += 0.15;

  // Clamp target
  targetX = Math.max(-4, Math.min(4, targetX));

  // Smooth movement
  car.position.x += (targetX - car.position.x) * 0.1;

  // Clamp car position
  car.position.x = Math.max(-4, Math.min(4, car.position.x));

  // Move road
  road.position.z += speed;

  if (road.position.z > 50) {
    road.position.z = 0;
  }

  // Camera follow
  camera.position.x = car.position.x;
  camera.lookAt(car.position);

  // Distance update
  distance += speed;
  document.getElementById("distance").innerText =
    "Distance: " + Math.floor(distance) + " m";

  // Day/Night cycle
  time += 0.002;
  const lightIntensity = (Math.sin(time) + 1) / 2;
  light.intensity = lightIntensity;

  scene.background = new THREE.Color().setHSL(
    0.6,
    0.5,
    0.2 + lightIntensity * 0.5
  );

  renderer.render(scene, camera);
}

animate();

// Resize fix
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
