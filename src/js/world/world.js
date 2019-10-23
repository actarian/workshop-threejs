/* jshint esversion: 6 */

import Camera from '../camera/camera';
import Lights from '../lights/lights';
import Materials from '../materials/materials';
import Renderer from '../renderer/renderer';
import Scene from '../scene/scene';
import Emittable from '../threejs/interactive/emittable';

export default class World extends Emittable {

	constructor(container, callback) {
		super();
		this.clock = new THREE.Clock();
		this.container = container;
		this.size = { width: 0, height: 0, aspect: 0 };
		const scene = this.scene = new Scene();
		const camera = this.camera = new Camera(container, scene);
		const renderer = this.renderer = new Renderer(container);
		const lights = this.lights = new Lights(scene);
		const materials = this.materials = new Materials(renderer, (materials) => {
			if (typeof callback === 'function') {
				callback(this);
			}
		});
		this.resize = this.resize.bind(this);
		this.resize();
		window.addEventListener('resize', this.resize, false);
		this.animate();
	}

	resize() {
		try {
			const container = this.container;
			const w = container.offsetWidth;
			const h = container.offsetHeight;
			const size = this.size;
			size.width = w;
			size.height = h;
			size.aspect = w / h;
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
			scene.children.forEach(x => {
				if (typeof x.userData.render === 'function') {
					x.userData.render(time, tick);
				}
			});
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

	static init() {
		[...document.querySelectorAll('[example-01]')].map(x => new World(x));
	}

}
