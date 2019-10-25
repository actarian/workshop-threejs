/* jshint esversion: 6 */

import { nextHex } from '../colors/colors';
import Model from '../model/model';
import World from '../world/world';

const deg = THREE.Math.degToRad;

export default class Example03 {

	constructor(container) {
		this.container = container;

		// RANDOM COLOR TO SECTIONS
		const sections = [...document.querySelectorAll('.section')].forEach(node => {
			node.style.backgroundColor = nextHex();
		});

		// WORLD
		const world = new World(container, (world) => {
			// MODELS
			const models = [...document.querySelectorAll('[model]')].map((node, index) => {
				const model = new Model(node, {
					world: world,
					render: (instance, time, tick) => {
						const mesh = instance.mesh;
						const scroll = 0.5 - Math.min(0.5, instance.getScroll());
						mesh.rotation.x = deg(180) * scroll;
						// mesh.rotation.y = deg(180) * scroll;
						const scale = instance.scale;
						mesh.scale.set(scale.x, scale.y, scale.z);
						const position = instance.position;
						// mesh.position.set(position.x, position.y + 2.5 - scroll * 5, position.z);
						if (index % 2 === 0) {
							mesh.position.set(position.x - 6.5 * scroll, position.y, position.z);
						} else {
							mesh.position.set(position.x + 6.5 * scroll, position.y, position.z);
						}
					}
				});
				return model;
			});
		});
	}

}
