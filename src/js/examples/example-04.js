/* jshint esversion: 6 */

import { nextHex } from '../colors/colors';
import DomPicture from '../dom/dom.picture';
import World from '../world/world';

const deg = THREE.Math.degToRad;

export default class Example04 {

	constructor(container) {
		this.container = container;

		const sections = [...document.querySelectorAll('.section')].forEach(node => {
			node.style.backgroundColor = nextHex();
		});

		const world = new World(container, (world) => {
			const pictures = [...document.querySelectorAll('[picture]')].map((node, index) => {
				const picture = new DomPicture(node, {
					world: world,
					render: (domPicture, time, tick) => {
						const picture = domPicture.picture;
						const scroll = domPicture.getScroll();
						// picture.rotation.x = deg(90) + deg(180) * scroll;
						// picture.rotation.y = deg(180) * scroll;
						const scale = domPicture.scale;
						picture.scale.set(scale.x, scale.y, scale.z);
						const position = domPicture.position;
						picture.position.set(position.x, position.y, position.z);
						/*
						if (index % 2 === 0) {
							picture.position.set(position.x + 2.5 - scroll * 5, position.y, position.z);
						} else {
							picture.position.set(position.x - 2.5 + scroll * 5, position.y, position.z);
						}
						*/
					}
				});
				return picture;
			});
		});
	}

}
