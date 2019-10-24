/* jshint esversion: 6 */

// import { nextHex } from '../colors/colors';
import PictureShader from '../picture/picture.shader';
import Plane from '../plane/plane';
import Title from '../title/title';
import World from '../world/world';

const deg = THREE.Math.degToRad;

export default class Example04 {

	constructor(container) {
		this.container = container;

		// RANDOM COLOR TO SECTIONS
		/*
		const sections = [...document.querySelectorAll('.section')].forEach(node => {
			node.style.backgroundColor = nextHex();
		});
		*/

		// WORLD
		const world = new World(container, (world) => {
			console.log(world);

			// PLANES
			const planes = [...document.querySelectorAll('[plane]')].map((node, index) => {
				const plane = new Plane(node, {
					world: world,
				});
				return plane;
			});

			// PICTURES
			const pictures = [...document.querySelectorAll('[picture]')].map((node, index) => {
				const picture = new PictureShader(node, {
					world: world,
					render: (instance, time, tick) => {
						const mesh = instance.mesh;
						const scale = instance.scale;
						mesh.scale.set(scale.x, scale.y, scale.z);
						const position = instance.position;
						mesh.position.set(position.x, position.y, position.z);
					}
				});
				return picture;
			});
		});

		// TITLES
		const titles = [...document.querySelectorAll('[title]')].map(node => new Title(node));
	}

}
