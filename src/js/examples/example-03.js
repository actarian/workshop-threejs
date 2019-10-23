/* jshint esversion: 6 */

import { nextHex } from '../colors/colors';
import DomModel from '../dom/dom.model';
import World from '../world/world';

const deg = THREE.Math.degToRad;

export default class Example03 {

	constructor(container) {
		this.container = container;

		const sections = [...document.querySelectorAll('.section')].forEach(node => {
			node.style.backgroundColor = nextHex();
		});

		const world = new World(container, (world) => {
			const models = [...document.querySelectorAll('[model]')].map((node, index) => {
				const model = new DomModel(node, {
					world: world,
					render: (domModel, time, tick) => {
						const model = domModel.model;
						const scroll = domModel.getScroll();
						model.rotation.x = deg(180) * scroll;
						// model.rotation.y = deg(180) * scroll;
						const scale = domModel.scale;
						model.scale.set(scale.x, scale.y, scale.z);
						const position = domModel.position;
						// model.position.set(position.x, position.y + 2.5 - scroll * 5, position.z);
						if (index % 2 === 0) {
							model.position.set(position.x + 2.5 - scroll * 5, position.y, position.z);
						} else {
							model.position.set(position.x - 2.5 + scroll * 5, position.y, position.z);
						}
					}
				});
				return model;
			});
		});
	}

}
