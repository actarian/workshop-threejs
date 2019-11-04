/* jshint esversion: 6 */

import { randomColor } from '../colors/colors';

export default class Helper {

	static make(object) {
		let helper;
		const color = 0xff0000;
		// const color = Helper.randomColor();
		if (object instanceof THREE.DirectionalLight) {
			helper = new THREE.DirectionalLightHelper(object, 0.5, color);
		}
		if (object instanceof THREE.HemisphereLight) {
			helper = new THREE.HemisphereLightHelper(object, 0.5, color);
		}
		if (object instanceof THREE.PointLight) {
			helper = new THREE.PointLightHelper(object, 0.2, color);
		}
		if (object instanceof THREE.RectAreaLight) {
			helper = new THREE.RectAreaLightHelper(object, color);
		}
		if (object instanceof THREE.SpotLight) {
			helper = new THREE.SpotLightHelper(object, color);
		}
		return helper;
	}

	static randomColor() {
		return randomColor();
	}

}
