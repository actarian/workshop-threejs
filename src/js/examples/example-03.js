/* jshint esversion: 6 */

import { nextHex } from '../colors/colors';
import Ease from '../ease/ease';
import Model from '../model/model';
import Title from '../title/title';
import World from '../world/world';

const deg = THREE.Math.degToRad;

export default class Example03 {

	constructor(node) {
		this.node = node;

		// RANDOM COLOR TO SECTIONS
		const sections = [...document.querySelectorAll('.section')].forEach(node => {
			node.style.backgroundColor = nextHex();
		});

		// WORLD
		const world = new World(node, (world) => {
			// MODELS
			const models = [...document.querySelectorAll('[model]')].map((node, index) => {
				const model = new Model(node, {
					world: world,
					render: (instance, time, tick) => {
						const mesh = instance.mesh;
						const scroll = Ease.Sine.In(0.5 - Math.min(0.5, instance.getScroll()));
						/*
						if (index === 1) {
							console.log(instance.getScroll());
						}
						*/
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
						/*
						mesh.position.z = -1000 * scroll;
						mesh.material.opacity = 1 - scroll;
						*/
					}
				});
				return model;
			});
		});

		// TITLES
		const titles = [...document.querySelectorAll('[title]')].map(node => new Title(node));
	}

}
