/* jshint esversion: 6 */

import { hexToInt, nextHex } from '../colors/colors';
import DomService from '../dom/dom.service';

const deg = THREE.Math.degToRad;
const domService = DomService.singleton();
export const PlaneGeometry = new THREE.PlaneBufferGeometry(1, 1, 20, 20);

export default class Plane {

	constructor(node, options) {
		if (!options) {
			return console.error('Plane options undefiend!');
		}
		if (!options.world) {
			return console.error('Plane options.world undefiend!');
		}
		this.node = node;
		this.world = options.world;
		this.speed = 0;
		this.scale = new THREE.Vector3();
		this.position = new THREE.Vector3();
		Object.assign(this, options);
		this.create((mesh) => this.loaded(mesh));
	}

	create(callback) {
		const hex = this.node.getAttribute('plane') || nextHex();
		const material = this.getMaterial(hexToInt(hex));
		const mesh = new THREE.Mesh(PlaneGeometry, material);
		mesh.renderOrder = 1;
		if (typeof callback === 'function') {
			callback(mesh);
		}
	}

	getMaterial(color) {
		const material = new THREE.MeshBasicMaterial({
			color: color,
			transparent: true,
			opacity: 1.0,
			alphaTest: 0.01,
			side: THREE.DoubleSide,
		});
		return material;
	}

	loaded(mesh) {
		this.mesh = mesh;
		mesh.userData.render = (time, tick) => {
			if (this.intersection) {
				this.update(this, time, tick);
				this.render(this, time, tick);
			}
		};
		const world = this.world;
		world.scene.add(mesh);
		const node = this.node;
		domService.scrollIntersection$(node).subscribe(event => {
			this.scroll = event.scroll;
			this.intersection = event.intersection;
			this.calculateScaleAndPosition();
		});
		console.log('Plane.loaded', mesh);
	}

	calculateScaleAndPosition() {
		this.world.reposPlane(this, this.intersection);
		this.speed += (this.scroll.speed - this.speed) / 8;
	}

	update(domPlane, time, tick) {
		const mesh = domPlane.mesh;
		mesh.material.opacity = 1;
	}

	render(domPlane, time, tick) {
		const mesh = domPlane.mesh;
		const scale = domPlane.scale;
		mesh.scale.set(scale.x, scale.y, scale.z);
		const position = domPlane.position;
		mesh.position.set(position.x, position.y, position.z);
	}

}
