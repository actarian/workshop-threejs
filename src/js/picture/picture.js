/* jshint esversion: 6 */

import DomService from '../dom/dom.service';
import { PlaneGeometry } from '../plane/plane';
import Texture from '../texture/texture';

export default class Picture {

	constructor(node, options) {
		if (!options) {
			return console.error('Picture options undefiend!');
		}
		if (!options.world) {
			return console.error('Picture options.world undefiend!');
		}
		this.node = node;
		this.world = options.world;
		Object.assign(this, options);
		this.speed = 0;
		this.scale = new THREE.Vector3();
		this.position = new THREE.Vector3();
		this.create((mesh) => this.loaded(mesh));
	}

	create(callback) {
		const texture = Texture.load(this.node.getAttribute('picture'), this.world.renderer, (texture) => {
			this.node.style.paddingBottom = `${texture.image.naturalHeight / texture.image.naturalWidth * 100}%`;
			const material = this.getMaterial(texture);
			const mesh = new THREE.Mesh(PlaneGeometry, material);
			mesh.renderOrder = 2;
			if (typeof callback === 'function') {
				callback(mesh);
			}
		});
	}

	getMaterial(texture) {
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			color: 0xffffff,
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
		DomService.scrollIntersection$(node).subscribe(event => {
			this.scroll = event.scroll;
			this.intersection = event.intersection;
			this.calculateScaleAndPosition();
		});
		console.log('Picture.loaded', mesh);
	}

	calculateScaleAndPosition() {
		this.world.reposPlane(this, this.intersection);
		this.position.z += 1;
		this.speed += (this.scroll.speed - this.speed) / 8;
	}

	update(domPicture, time, tick) {
		const mesh = domPicture.mesh;
		mesh.material.opacity = 1;
	}

	render(domPicture, time, tick) {
		const mesh = domPicture.mesh;
		const scale = domPicture.scale;
		mesh.scale.set(scale.x, scale.y, scale.z);
		const position = domPicture.position;
		mesh.position.set(position.x, position.y, position.z);
	}

}
