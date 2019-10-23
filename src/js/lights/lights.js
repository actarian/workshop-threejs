/* jshint esversion: 6 */

export default class Lights extends THREE.Group {

	constructor(parent) {
		super();
		const light = new THREE.HemisphereLight(0xffffff, 0x5e6770, 1.0);
		light.position.set(0, 20, 0);
		parent.add(light);
	}

	render(time) {
		this.rotation.y = THREE.Math.degToRad(15) * Math.cos(time * 1.1);
	}

}
