// TODO: select state on 2d
// TODO: explanation (decoherence concept)
// TODO: matrix + diagrams?

import * as THREE from 'three';
// import Stats from 'three/addons/libs/stats.module.js';
import { Lut } from 'three/addons/math/Lut.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';

import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import { Line2 } from 'three/addons/lines/Line2.js';


const settings = {
	entanglement: 1,
};

const container = document.getElementById('container');
const uiContainer = document.getElementById('ui-container');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.autoClear = false;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const uiRenderer = new THREE.WebGLRenderer({ antialias: true });
uiRenderer.autoClear = false;
uiRenderer.setPixelRatio(window.devicePixelRatio);
uiRenderer.setSize(uiContainer.clientWidth, uiContainer.clientHeight);
uiContainer.appendChild(uiRenderer.domElement);

const labelRenderer = new CSS2DRenderer({ antialias: true });
labelRenderer.setSize(container.clientWidth, container.clientHeight);
labelRenderer.domElement.style.position = 'absolute';
labelRenderer.domElement.style.top = '0px';
container.appendChild(labelRenderer.domElement);

const uiLabelRenderer = new CSS2DRenderer({ antialias: true });
uiLabelRenderer.setSize(uiContainer.clientWidth, uiContainer.clientHeight);
uiLabelRenderer.domElement.style.position = 'absolute';
uiLabelRenderer.domElement.style.top = '0px';
uiContainer.appendChild(uiLabelRenderer.domElement);

matrix = document.getElementById('matrix');
katex.render(`C = \\begin{bmatrix} 1.00 & 0.00 & 0.00 & ${settings.entanglement.toFixed(2)} \\\\ 0.00 & 0.00 & 0.00 & 0.00 \\\\ 0.00 & 0.00 & 0.00 & 0.00 \\\\ ${settings.entanglement.toFixed(2)} & 0.00 & 0.00 & 1.00 \\end{bmatrix}`, matrix, { displayMode: true });
const gui = new GUI({ autoPlace: false });
gui.add(settings, 'entanglement', 0, 1).step(0.01).onChange(function (value) {
	right_material.uniforms.entanglement.value = value;
	plane.material.uniforms.entanglement.value = value;

	katex.render(`C = \\begin{bmatrix} 1.00 & 0.00 & 0.00 & ${value.toFixed(2)} \\\\ 0.00 & 0.00 & 0.00 & 0.00 \\\\ 0.00 & 0.00 & 0.00 & 0.00 \\\\ ${value.toFixed(2)} & 0.00 & 0.00 & 1.00 \\end{bmatrix}`, matrix, { displayMode: true });
});
document.getElementById('gui-container').appendChild(gui.domElement);

window.addEventListener('resize', function () {
	camera.aspect = container.clientWidth / container.clientHeight;
	camera.updateProjectionMatrix();

	uiCamera.left = -uiContainer.clientWidth / uiContainer.clientHeight * 1.1;
	uiCamera.right = uiContainer.clientWidth / uiContainer.clientHeight * 1.1;
	uiCamera.updateProjectionMatrix();

	renderer.setSize(container.clientWidth, container.clientHeight);
	labelRenderer.setSize(container.clientWidth, container.clientHeight);

	uiRenderer.setSize(uiContainer.clientWidth, uiContainer.clientHeight);
	uiLabelRenderer.setSize(uiContainer.clientWidth, uiContainer.clientHeight);
});

//

const camera = new THREE.PerspectiveCamera(
	30, container.clientWidth / container.clientHeight, 1, 10000);
camera.position.set(0, 100, 1100);

const controls = new OrbitControls(camera, container);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enablePan = false;
// controls.enableZoom = false;

const scene = new THREE.Scene();
// scene.background = new THREE.Color('#111111');

//

const uiCamera = new THREE.OrthographicCamera(- uiContainer.clientWidth / uiContainer.clientHeight * 1.1, uiContainer.clientWidth / uiContainer.clientHeight * 1.1, 1.1, - 1.1, 1, 2);
uiCamera.position.set(0, 0, 1);

const uiScene = new THREE.Scene();
// uiScene.background = new THREE.Color('#111111');

const lut = new Lut();
lut.setColorMap('blackbody', 256);

let lut_array = [];
for (let i = 0; i <= lut.n; i++) {
	lut_array.push(new THREE.Vector3(lut.lut[i].r, lut.lut[i].g, lut.lut[i].b))
}

let sprite = new THREE.Sprite(new THREE.SpriteMaterial({
	map: new THREE.CanvasTexture(lut.createCanvas()),
	rotation: -Math.PI / 2,
}));
sprite.material.map.colorSpace = THREE.SRGBColorSpace;
sprite.scale.x = 0.125;
sprite.scale.y = 0.9;
// sprite.position.y = -1.0 + 0.102 / 2;
sprite.position.y = -0.7;
uiScene.add(sprite);

//

let plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
	uniforms: {
		entanglement: { value: settings.entanglement },
		lut: { type: "v3v", value: lut_array },
	},
	vertexShader: document.getElementById('vertexShader2').textContent,
	fragmentShader: document.getElementById('fragmentShader2').textContent
}));
plane.scale.multiplyScalar(0.9);
const uiObject = new THREE.Object3D();
uiObject.name = 'uiInteractable';
uiObject.add(plane);
uiScene.add(uiObject);


// add latex labels
let label = new CSS2DObject(document.createElement('div'));
label.element.style.color = 'white';
katex.render('\\ket{0}', label.element);
label.position.set(-125, 110, 0);
scene.add(label);

label = label.clone();
label.position.set(125, 110, 0);
scene.add(label);

label = label.clone();
katex.render('\\ket{1}', label.element);
label.position.set(-125, -110, 0);
scene.add(label);

label = label.clone();
label.position.set(125, -110, 0);
scene.add(label);

label = label.clone();
katex.render('\\ket{+}', label.element);
label.position.set(-125, 0, 110);
scene.add(label);

label = label.clone();
label.position.set(125, 0, 110);
scene.add(label);

label = label.clone();
katex.render('\\ket{-}', label.element);
label.position.set(-125, 0, -110);
scene.add(label);

label = label.clone();
label.position.set(125, 0, -110);
scene.add(label);

label = label.clone();
katex.render('\\ket{+i}', label.element);
label.position.set(-15, 0, 0);
scene.add(label);

label = label.clone();
label.position.set(235, 0, 0);
scene.add(label);

label = label.clone();
katex.render('\\ket{-i}', label.element);
label.position.set(-235, 0, 0);
scene.add(label);

label = label.clone();
label.position.set(15, 0, 0);
scene.add(label);

//

label = label.clone();
katex.render('0', label.element);
label.position.set(-0.45, -0.8, 0);
uiScene.add(label);

label = label.clone();
katex.render('0.5', label.element);
label.position.set(0, -0.8, 0);
uiScene.add(label);

label = label.clone();
katex.render('1', label.element);
label.position.set(0.45, -0.8, 0);
uiScene.add(label);

//


label = label.clone();
katex.render('\\ket{0}', label.element);
label.position.set(-0.45, -0.51, 0);
uiScene.add(label);

label = label.clone();
katex.render('\\ket{+}', label.element);
label.position.set(0, -0.51, 0);
uiScene.add(label);

label = label.clone();
katex.render('\\ket{1}', label.element);
label.position.set(0.45, -0.51, 0);
uiScene.add(label);

label = label.clone();
katex.render('\\ket{0}', label.element);
label.position.set(-0.51, -0.45, 0);
uiScene.add(label);

label = label.clone();
katex.render('\\ket{+}', label.element);
label.position.set(-0.51, 0, 0);
uiScene.add(label);

label = label.clone();
katex.render('\\ket{1}', label.element);
label.position.set(-0.51, 0.45, 0);
uiScene.add(label);

//

const canvas = document.createElement('canvas');
canvas.width = 128;
canvas.height = 128;

const context = canvas.getContext('2d');
const gradient = context.createRadialGradient(
	canvas.width / 2, canvas.height / 2, 0, canvas.width / 2,
	canvas.height / 2, canvas.width / 2);
gradient.addColorStop(0., 'rgb(200,200,200)');
gradient.addColorStop(0.9, 'rgba(1, 1, 1, 0)');

context.fillStyle = gradient;
context.fillRect(0, 0, canvas.width, canvas.height);

const shadowTexture = new THREE.CanvasTexture(canvas);

const shadowMaterial = new THREE.MeshBasicMaterial({ map: shadowTexture, transparent: true });
const shadowGeo = new THREE.PlaneGeometry(150, 150, 1, 1);

let shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
shadowMesh.position.y = -150;
shadowMesh.position.x = -125;
shadowMesh.rotation.x = -Math.PI / 2;
scene.add(shadowMesh);

shadowMesh = new THREE.Mesh(shadowGeo, shadowMaterial);
shadowMesh.position.y = -150;
shadowMesh.position.x = 125;
shadowMesh.rotation.x = -Math.PI / 2;
scene.add(shadowMesh);

//

const line_material = new THREE.LineBasicMaterial({ color: 0x404040, opacity: 0.5 });

const right_material = new THREE.ShaderMaterial({
	uniforms: {
		entanglement: { value: settings.entanglement },
		alpha_left: { value: settings.alpha_left },
		theta_left: { value: settings.theta_left },
		lut: { type: "v3v", value: lut_array },
	},
	vertexShader: document.getElementById('vertexShader').textContent,
	fragmentShader: document.getElementById('fragmentShader').textContent
});

const left_material = new THREE.MeshBasicMaterial(
	{ opacity: 0.08, transparent: true, color: 0xf0f0f0 });

//

const radius = 100;
const res = 2 ** 5;

let mesh = new THREE.Mesh(new THREE.SphereGeometry(1, res * 2, res), left_material);
mesh.position.x = -1.25 * radius;
mesh.scale.multiplyScalar(radius);

const object = new THREE.Object3D();
object.name = 'interactable';
object.add(mesh);
scene.add(object);

const line_mesh = new THREE.Mesh(new THREE.SphereGeometry(1, res, res / 2), left_material);
line_mesh.position.x = -1.25 * radius;
line_mesh.scale.multiplyScalar(radius);

let line = new THREE.LineSegments(new THREE.EdgesGeometry(line_mesh.geometry), line_material);
line.scale.multiplyScalar(radius * 1.005);
line.position.x = -1.25 * radius;
scene.add(line);

mesh = mesh.clone();
mesh.material = right_material;
mesh.position.x = 1.25 * radius;
scene.add(mesh);

line = new THREE.LineSegments(new THREE.EdgesGeometry(line_mesh.geometry), line_material);
line.scale.multiplyScalar(radius * 1.005);
line.position.x = 1.25 * radius;
scene.add(line);

//

const positions = [];
for (let i = 0; i < res; i++) {
	positions.push(
		0,
		Math.cos(i / res * Math.PI),
		Math.sin(i / res * Math.PI)
	);
}

let geometry = new LineGeometry();
geometry.setPositions(positions);
let mat_left = new LineMaterial({
	color: 0x8338EC,
	linewidth: 8,
});
const mat_right = new LineMaterial({
	color: 0x39EDDE,
	linewidth: 8,
});
let l = new Line2(geometry, mat_left);
l.scale.multiplyScalar(radius * 1.005);
l.position.x = -1.25 * radius;
scene.add(l);

l = l.clone();
l.position.x = 1.25 * radius;
l.material = mat_right;
scene.add(l);

const left_positions = [-0.45, -0.47, 0, 0.45, -0.47, 0];
geometry = new LineGeometry();
l = new Line2(geometry, mat_left);
l.geometry.setPositions(left_positions);
uiScene.add(l);

const right_positions = [-0.47, -0.45, 0, -0.47, 0.45, 0];
geometry = new LineGeometry();
l = new Line2(geometry, mat_right);
l.geometry.setPositions(right_positions);
uiScene.add(l);
//

const pointer = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
const indicator = new THREE.ArrowHelper(
	new THREE.Vector3(0, 1, 0), new THREE.Vector3(-125, 0, 0), 100, 0xfffffa,
	10, 10);
scene.add(indicator);

container.addEventListener('mousedown', function (event) {
	const box = container.getBoundingClientRect();
	pointer.x = ((event.clientX - box.left) / container.clientWidth) * 2 - 1;
	pointer.y = -((event.clientY - box.top) / container.clientHeight) * 2 + 1;

	raycaster.setFromCamera(pointer, camera);
	const intersects = raycaster.intersectObjects(scene.getObjectByName('interactable').children);

	if (intersects.length > 0) {
		const point = intersects[0].point;
		let direction = point.sub(new THREE.Vector3(-125, 0, 0)).normalize();

		right_material.uniforms.alpha_left.value = Math.atan2(direction.z, direction.x);
		right_material.uniforms.theta_left.value = Math.atan2(Math.sqrt(direction.x * direction.x + direction.z * direction.z), direction.y);

		indicator.setDirection(direction);
	}
});

//

// uiContainer.addEventListener('mousedown', function (event) {
// 	const box = uiContainer.getBoundingClientRect();
// 	pointer.x = ((event.clientX - box.left) / uiContainer.clientWidth) * 2 - 1;
// 	pointer.y = -((event.clientY - box.top) / uiContainer.clientHeight) * 2 + 1;

// 	raycaster.setFromCamera(pointer, uiCamera);
// 	const intersects = raycaster.intersectObjects(uiScene.getObjectByName('uiInteractable').children);

// 	if (intersects.length > 0) {
// 		const point = intersects[0].uv;

// 		const theta = 2 * Math.asin(Math.sqrt(point.x));

// let direction = new THREE.Vector3(0, Math.sign(1 - point.x * 2) * Math.sqrt(Math.abs(1 - point.x * 2)), Math.sqrt(point.x * 2)).normalize();

// 		right_material.uniforms.alpha_left.value = Math.atan2(direction.z, direction.x);
// 		right_material.uniforms.theta_left.value = Math.atan2(Math.sqrt(direction.x * direction.x + direction.z * direction.z), direction.y);

// 		indicator.setDirection(direction);
// 	}
// });

//

function animate() {
	requestAnimationFrame(animate);

	controls.update();
	// stats.update();

	mat_left.resolution.set(container.clientWidth, container.clientHeight);
	mat_right.resolution.set(container.clientWidth, container.clientHeight);

	renderer.render(scene, camera);
	labelRenderer.render(scene, camera);

	mat_left.resolution.set(uiContainer.clientWidth, uiContainer.clientHeight);
	mat_right.resolution.set(uiContainer.clientWidth, uiContainer.clientHeight);

	uiRenderer.render(uiScene, uiCamera);
	uiLabelRenderer.render(uiScene, uiCamera);
}
animate();

