/* jshint esversion: 6 */

import { combineLatest, fromEventPattern, of } from 'rxjs';
import { map } from 'rxjs/operators';

const manager = new THREE.LoadingManager();

const cache = {};

export default class Texture {

	static defaults(texture, renderer) {
		texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
		// texture.wrapS = THREE.RepeatWrapping;
		// texture.wrapT = THREE.RepeatWrapping;
		return texture;
	}

	static load$(path, renderer) {
		if (cache[path]) {
			return of(cache[path]);
		}
		return fromEventPattern((handler) => {
			return new THREE.TextureLoader(manager).load(path, handler);
		}, (handler) => {
			// can't remove !!!
		}).pipe(
			map((texture) => {
				texture = this.defaults(texture, renderer);
				cache[path] = texture;
				return texture;
			})
		);
	}

	static loadMany$(paths, renderer) {
		return combineLatest(paths.map(x => this.load$(x, renderer)));
	}

	static load(path, renderer, callback) {
		if (cache[path]) {
			return cache[path];
		}
		const texture = new THREE.TextureLoader(manager).load(path, (texture) => {
			texture = this.defaults(texture, renderer);
			cache[path] = texture;
			if (typeof callback === 'function') {
				callback(texture);
			}
		});
		return texture;
	}

	static loadEquirectangularToCube(path, renderer, callback) {
		return new THREE.TextureLoader(manager).load(path, (texture) => {
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
