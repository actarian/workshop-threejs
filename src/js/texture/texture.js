/* jshint esversion: 6 */

const loader = new THREE.TextureLoader();

export default class Texture {

	static load(path, renderer, callback) {
		const texture = loader.load(path, (texture) => {
			texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
			texture.wrapS = THREE.RepeatWrapping;
			texture.wrapT = THREE.RepeatWrapping;
			if (typeof callback === 'function') {
				callback(texture);
			}
		});
		return texture;
	}

	static loadEquirectangularToCube(path, renderer, callback) {
		loader.load(path, (texture) => {
			texture.encoding = THREE.sRGBEncoding;
			const generator = new THREE.EquirectangularToCubeGenerator(texture, { resolution: 512 });
			const background = generator.renderTarget;
			const cubeMapTexture = generator.update(renderer);
			const pmremGenerator = new THREE.PMREMGenerator(cubeMapTexture);
			pmremGenerator.update(renderer);
			const pmremCubeUVPacker = new THREE.PMREMCubeUVPacker(pmremGenerator.cubeLods);
			pmremCubeUVPacker.update(renderer);
			const cubeRenderTarget = pmremCubeUVPacker.CubeUVRenderTarget;
			texture.dispose();
			pmremGenerator.dispose();
			pmremCubeUVPacker.dispose();
			if (typeof callback === 'function') {
				callback(cubeRenderTarget.texture, background.texture);
			}
		});
	}

	static setEnvMap(texture, ...materials) {
		materials.forEach(x => {
			x.envMap = texture;
			x.envMapIntensity = 1.0;
			x.needsUpdate = true;
		});
	}

}
