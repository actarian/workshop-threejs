/* jshint esversion: 6 */

export default class Fbx {

	constructor(path, success, error, progress) {
		error = error || ((error) => {
			console.log('fbx loader error', error);
		});
		progress = progress || ((xhr) => {
			console.log('fbx progress', Math.round(xhr.loaded / xhr.total * 100) + '%');
		});
		const loader = this.loader = new THREE.FBXLoader();
		return loader.load(path, success, progress, error);
	}

}
