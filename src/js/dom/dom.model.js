/* jshint esversion: 6 */

import { nextColor } from '../colors/colors';
import Ease from '../ease/ease';
import DomService from './dom.service';

const deg = THREE.Math.degToRad;

const domService = DomService.singleton();

export default class DomModel {

	constructor(node, options) {
		if (!options) {
			return console.error('DomModel options undefiend!');
		}
		if (!options.world) {
			return console.error('DomModel options.world undefiend!');
		}
		this.node = node;
		Object.assign(this, options);
		this.scale = new THREE.Vector3();
		this.position = new THREE.Vector3();
		this.create((model) => this.loaded(model));
	}

	create(callback) {
		const geometry = new THREE.BoxGeometry(1, 1, 1);
		const material = new THREE.MeshStandardMaterial({
			color: nextColor(),
			roughness: 0.4,
			metalness: 0.01,
		});
		const model = new THREE.Mesh(geometry, material);
		if (typeof callback === 'function') {
			callback(model);
		}
		return model;
	}

	loaded(model) {
		this.model = model;
		model.userData.render = (time, tick) => {
			if (this.intersection) {
				this.render(this, time, tick);
			}
		};
		const world = this.world;
		world.scene.add(model);
		const node = this.node;
		domService.scrollIntersection$(node).subscribe(event => {
			this.intersection = event.intersection;
			this.windowRect = event.windowRect;
			this.cameraRect = world.camera.cameraRect;
			this.calculateScaleAndPosition();
		});
	}

	calculateScaleAndPosition() {
		const intersection = this.intersection;
		const windowRect = this.windowRect;
		const cameraRect = this.cameraRect;
		const sx = intersection.width / windowRect.width * cameraRect.width;
		const sy = intersection.height / windowRect.height * cameraRect.height;
		this.scale.set(sx, sx, sx);
		const tx = intersection.x * cameraRect.width / windowRect.width - cameraRect.width / 2;
		const ty = intersection.y * cameraRect.height / windowRect.height - cameraRect.height / 2;
		this.position.set(tx, -ty, 0);
	}

	render(time, tick) {
		const model = this.model;
		const scale = this.scale;
		model.scale.set(scale.x, scale.y, scale.z);
		const position = this.position;
		model.position.set(position.x, position.y, position.z);
		const pow = this.pow();
		model.rotation.x = deg(180) * pow;
		model.rotation.y = deg(360) * pow;
	}

	getScroll(offset) {
		const scroll = this.intersection.scroll(offset);
		// console.log(scroll);
		return scroll;
	}

	getPow(offset) {
		let pow = Math.min(0.0, this.intersection.offset(offset)) + 1;
		pow = Math.max(0.0, pow);
		pow = Ease.Sine.InOut(pow);
		pow -= 1;
		return pow;
	}

}
