/* jshint esversion: 6 */

import { randomColor } from '../colors/colors';

export default class Example01 {

	constructor(container) {

		this.container = container;

		const scene = this.scene = new THREE.Scene();
		scene.background = new THREE.Color(randomColor());
		// scene.fog = new THREE.Fog(scene.background, 0, 50);

		const camera = this.camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.01, 2000);
		camera.position.set(0, 0, 5);
		camera.target = new THREE.Vector3();
		camera.zoom = 1;
		camera.updateProjectionMatrix();
		scene.add(camera);

		const fbxLoader = new THREE.FBXLoader();
		fbxLoader.load('./three/models/latte-corpo/latte-corpo.fbx', (model) => {

				const textureLoader = new THREE.TextureLoader();
				const corpo = new THREE.MeshStandardMaterial({
					color: randomColor(),
					roughness: 0.4,
					metalness: 0.01,
					map: textureLoader.load('./three/models/latte-corpo/latte-corpo.jpg', (texture) => {
						texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
					}),
				});
				const tappo = new THREE.MeshStandardMaterial({
					color: randomColor(),
					roughness: 0.4,
					metalness: 0.01,
				});
				model.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						if (child.name === 'corpo') {
							child.material = corpo.clone();
						} else {
							child.material = tappo.clone();
						}
						// console.log(child.name, child.material);
					}
				});
				model.userData.render = (time, tick) => {
					model.scale.set(0.3, 0.3, 0.3);
					model.rotation.x = Math.PI / 180 * 15;
					model.rotation.y += 0.01;
				};
				scene.add(model);
			},
			(xhr) => {
				console.log('fbx progress', Math.round(xhr.loaded / xhr.total * 100) + '%');
			},
			(error) => {
				console.log('fbx loader error', error);
			}
		);

		const light = new THREE.HemisphereLight(randomColor(), randomColor(), 1.0);
		light.position.set(0, 10, 0);
		scene.add(light);

		const renderer = this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			// alpha: true,
			// premultipliedAlpha: true,
			// preserveDrawingBuffer: false,
		});
		renderer.setClearColor(randomColor(), 1);
		renderer.setPixelRatio(window.devicePixelRatio);
		container.appendChild(renderer.domElement);

		this.addListeners();
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
