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

		// LISTENERS
		this.addListeners();

		// ANIMATION LOOP
		this.animate();

		// LIGHT
		const light = new THREE.HemisphereLight(randomColor(), randomColor(), 0.65);
		light.position.set(0, 10, 0);
		scene.add(light);

		// const key = 'latte-corpo';
		const key = 'gel-mousse-doccia';

		// MATERIAL
		const materialCorpo = new THREE.MeshStandardMaterial({
			name: 'corpo',
			color: 0xf4f4f6,
			roughness: 0.45,
			metalness: 0.01,
			map: Texture.load(`./three/models/${key}/${key}.jpg`, renderer),
			envMapIntensity: 1.5,
			side: THREE.FrontSide,
		});
		const materialWhite = new THREE.MeshStandardMaterial({
			name: 'white',
			color: 0xf4f4f6,
			roughness: 0.45,
			metalness: 0.01,
			envMapIntensity: 1.5,
			side: THREE.FrontSide,
		});
		const materialBlack = new THREE.MeshStandardMaterial({
			name: 'black',
			color: 0x222222,
			roughness: 0.05,
			metalness: 0.05,
			envMapIntensity: 1.5,
			side: THREE.FrontSide,
		});
		const materialTransparent = new THREE.MeshStandardMaterial({
			name: 'transparent',
			color: 0xaaaaaa,
			roughness: 0.05,
			metalness: 0.05,
			opacity: 0.4,
			transparent: true,
			alphaTest: 0.3,
			envMapIntensity: 3,
			side: THREE.FrontSide,
		});

		// MODEL (FBX LOADER)
		const fbxLoader = new THREE.FBXLoader();
		fbxLoader.load(`./three/models/${key}/${key}.fbx`, (object) => {
				switch (key) {
					case 'latte-corpo':
						object.traverse((child) => {
							if (child instanceof THREE.Mesh) {
								if (child.name === 'corpo') {
									child.material = materialCorpo;
								} else {
									child.material = materialWhite;
								}
								// console.log(child.name, child.material);
							}
						});
						object.scale.set(0.3, 0.3, 0.3);
						object.userData.render = (time, tick) => {
							object.rotation.x = Math.PI / 180 * 15;
							object.rotation.y += 0.01;
						};
						break;
					case 'gel-mousse-doccia':
						object.traverse((child) => {
							if (child instanceof THREE.Mesh) {
								switch (child.name) {
									case 'spray_bottle':
										child.renderOrder = 1;
										child.material = materialCorpo;
										break;
									case 'spray':
									case 'cilindro1':
									case 'cilindro2':
										child.renderOrder = 2;
										child.material = materialBlack;
										break;
									case 'tappo':
										child.renderOrder = 3;
										child.material = materialTransparent;
										break;
									default:
										child.renderOrder = 1;
										child.material = materialWhite;
								}
								// console.log(child.name, child.material);
							}
						});
						object.scale.set(0.2, 0.2, 0.2);
						object.userData.render = (time, tick) => {
							object.rotation.x = Math.PI / 180 * 15;
							object.rotation.y -= 0.01;
						};
						break;
				}
				Texture.loadEquirectangularToCube('./three/environment/environment-07.jpg', renderer, (texture, backgroundTexture) => {
					Texture.setEnvMap(texture, materialCorpo, materialWhite, materialBlack, materialTransparent);
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
