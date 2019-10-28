/* jshint esversion: 6 */

import Camera from '../camera/camera';
import Lights from '../lights/lights';
import Rect from '../rect/rect';
import Renderer from '../renderer/renderer';
import Scene from '../scene/scene';
import Emittable from '../threejs/interactive/emittable';

export default class World extends Emittable {

	constructor(container, callback) {
		super();
		this.clock = new THREE.Clock();
		this.container = container;
		this.worldRect = Rect.fromNode(container);
		const scene = this.scene = new Scene();
		const camera = this.camera = new Camera(container, scene);
		const renderer = this.renderer = new Renderer(container);
		const lights = this.lights = new Lights(scene);
		this.resize = this.resize.bind(this);
		this.resize();
		if (typeof callback === 'function') {
			callback(this);
		}
		window.addEventListener('resize', this.resize, false);
		this.animate();
	}

	resize() {
		try {
			const container = this.container;
			const w = container.offsetWidth;
			const h = container.offsetHeight;
			this.worldRect.setSize(w, h);
			this.renderer.setSize(w, h);
			this.camera.setSize(w, h);
		} catch (error) {
			console.log('error', error);
		}
	}

	render() {
		try {
			/*
			const time = this.clock.getElapsedTime();
			const delta = this.clock.getDelta();
			const tick = Math.floor(time * 60);
			*/
			const time = performance.now();
			const tick = this.tick_ ? ++this.tick_ : this.tick_ = 1;
			const scene = this.scene;
			for (let i = 0; i < scene.children.length; i++) {
				const x = scene.children[i];
				if (typeof x.userData.render === 'function') {
					x.userData.render(time, tick);
				}
			}
			/*
			scene.children.forEach(x => {
				if (typeof x.userData.render === 'function') {
					x.userData.render(time, tick);
				}
			});
			*/
			const camera = this.camera;
			const renderer = this.renderer;
			renderer.render(scene, camera);
		} catch (error) {
			console.log('error', error);
		}
	}

	animate() {
		const renderer = this.renderer;
		renderer.setAnimationLoop(() => {
			this.render();
		});
	}

	reposPlane(object, rect) {
		const worldRect = this.worldRect;
		const cameraRect = this.camera.cameraRect;
		const sx = rect.width / worldRect.width * cameraRect.width;
		const sy = rect.height / worldRect.height * cameraRect.height;
		object.scale.set(sx, sy, 1);
		const tx = rect.x * cameraRect.width / worldRect.width - cameraRect.width / 2;
		const ty = rect.y * cameraRect.height / worldRect.height - cameraRect.height / 2;
		object.position.set(tx, -ty, 0);
	}

	repos(object, rect) {
		const worldRect = this.worldRect;
		const cameraRect = this.camera.cameraRect;
		const sx = rect.width / worldRect.width * cameraRect.width;
		const sy = rect.height / worldRect.height * cameraRect.height;
		object.scale.set(sx, sx, sx);
		const tx = rect.x * cameraRect.width / worldRect.width - cameraRect.width / 2;
		const ty = rect.y * cameraRect.height / worldRect.height - cameraRect.height / 2;
		object.position.set(tx, -ty, 0);
	}

	static init() {
		return [...document.querySelectorAll('[world]')].map(x => new World(x));
	}

}
