/* jshint esversion: 6 */

import { randomColor } from '../colors/colors';
import Texture from '../texture/texture';

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
		const light = new THREE.HemisphereLight(randomColor(), randomColor(), 0.65);
		light.position.set(0, 10, 0);
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

		// MODEL (FBX LOADER)
		const fbxLoader = new THREE.FBXLoader();
		fbxLoader.load('./three/models/latte-corpo/latte-corpo.fbx', (object) => {
				const materialCorpo = new THREE.MeshStandardMaterial({
					color: 0xffffff,
					roughness: 0.3,
					metalness: 0.03,
					map: Texture.load('./three/models/latte-corpo/latte-corpo.jpg', renderer),
				});
				const materialTappo = new THREE.MeshStandardMaterial({
					color: 0xffffff,
					roughness: 0.3,
					metalness: 0.03,
				});
				object.traverse((child) => {
					if (child instanceof THREE.Mesh) {
						if (child.name === 'corpo') {
							child.material = materialCorpo;
						} else {
							child.material = materialTappo;
						}
						// console.log(child.name, child.material);
					}
				});
				object.userData.render = (time, tick) => {
					object.scale.set(0.3, 0.3, 0.3);
					object.rotation.x = Math.PI / 180 * 15;
					object.rotation.y += 0.01;
				};
				Texture.loadEquirectangularToCube('./three/environment/environment-10.jpg', renderer, (texture, backgroundTexture) => {
					Texture.setEnvMap(texture, materialCorpo, materialTappo);
					scene.add(object);
				});
				// scene.add(object);
			},
			(xhr) => {
				console.log('fbx progress', Math.round(xhr.loaded / xhr.total * 100) + '%');
			},
			(error) => {
				console.log('fbx loader error', error);
			}
		);

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
