/* jshint esversion: 6 */

import Model from '../model/model';
import Title from '../title/title';
import World from '../world/world';

export default class Example10 {

	constructor(container) {
		this.container = container;

		const world = new World(container, (world) => {
			const models = [...document.querySelectorAll('[model]')].map(node => {
				const model = new Model(node, world);
				return model;
			});
			const titles = [...document.querySelectorAll('[title]')].map(node => {
				const title = new Title(node);
				return title;
			});
		});

	}

}
