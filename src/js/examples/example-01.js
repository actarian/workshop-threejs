/* jshint esversion: 6 */

import { randomColor } from '../colors/colors';

export default class Example01 {

	constructor(container) {

		this.container = container;

		// SCENE
		const scene = this.scene = new THREE.Scene();
		scene.background = new THREE.Color(randomColor());
		// scene.fog = new THREE.Fog(scene.background, 0, 50);

		// CAMERA
		const camera = this.camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.01, 2000);
		camera.position.set(0, 0, 5);
		camera.target = new THREE.Vector3();
		camera.zoom = 1;
		camera.updateProjectionMatrix();
		scene.add(camera);

		// LIGHT
		const light = new THREE.PointLight(randomColor(), 1.0);
		light.position.set(0, 10, 5);
		/*
		light.userData.render = (time, tick) => {
			light.position.y = Math.cos(tick * Math.PI / 180) * 10;
		};
		*/
		scene.add(light);

		// RENDERER
		const renderer = this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			// alpha: true,
			// premultipliedAlpha: true,
			// preserveDrawingBuffer: false,
		});
		renderer.setClearColor(randomColor(), 1);
		renderer.setPixelRatio(window.devicePixelRatio);
		container.appendChild(renderer.domElement);

		// MODEL
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshStandardMaterial({
			color: randomColor(),
			roughness: 0.4,
			metalness: 0.01,
		});
		const cube = new THREE.Mesh(geometry, material);
		/*
		cube.userData.render = (time, tick) => {
			cube.rotation.x += 0.01;
			cube.rotation.y += 0.01;
		};
		*/
		scene.add(cube);

		// LISTENERS
		this.addListeners();

		// ANIMATION LOOP
		this.animate();
	}

	addListeners() {
		const resize = this.resize = this.resize.bind(this);
		window.addEventListener('resize', resize, false);
		resize();
	}

	resize() {
		try {
			const container = this.container;
			const w = container.offsetWidth;
			const h = container.offsetHeight;
			const renderer = this.renderer;
			renderer.setSize(w, h);
			const camera = this.camera;
			camera.aspect = w / h;
			camera.updateProjectionMatrix();

		} catch (error) {
			console.error('error', error);
		}
	}

	render() {
		try {
			const time = performance.now();
			const tick = this.tick_ ? ++this.tick_ : this.tick_ = 1;
			const scene = this.scene;
			scene.children.forEach(x => {
				if (typeof x.userData.render === 'function') {
					x.userData.render(time, tick);
				}
			});
			const camera = this.camera;
			const renderer = this.renderer;
			renderer.render(scene, camera);
		} catch (error) {
			console.error('error', error);
		}
	}

	animate() {
		const renderer = this.renderer;
		renderer.setAnimationLoop(() => {
			this.render();
		});
	}

}
