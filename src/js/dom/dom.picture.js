/* jshint esversion: 6 */

import Ease from '../ease/ease';
import DomService from './dom.service';

const USE_SHADER_MATERIAL = true;

const vertexShader = /* glsl */ `
varying vec2 vUv;
uniform float uTime;
uniform float uPow;
uniform float uSpeed;

void main() {
	vUv = uv;
	vec3 vPosition = position;
	float s = uSpeed * -0.05;
	vPosition.y += cos(uv.x - 0.5) * s - s;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}
`;

const fragmentShader = /* glsl */ `
uniform sampler2D uImage;
uniform float uOpacity;
varying vec2 vUv;
void main() {
	vec4 color = texture2D(uImage, vUv);
	color.a *= uOpacity;
	if (color.a < 0.01) discard;
	gl_FragColor = color;
	gl_FragColor.rgb *= gl_FragColor.a;
}
`;

const deg = THREE.Math.degToRad;

const domService = DomService.singleton();
const geometry = new THREE.PlaneBufferGeometry(1, 1, 20, 20);

export default class DomPicture {

	constructor(node, options) {
		if (!options) {
			return console.error('DomPicture options undefiend!');
		}
		if (!options.world) {
			return console.error('DomPicture options.world undefiend!');
		}
		this.node = node;
		Object.assign(this, options);
		this.speed = 0;
		this.scale = new THREE.Vector3();
		this.position = new THREE.Vector3();
		this.create((picture) => this.loaded(picture));
	}

	create(callback) {
		const loader = new THREE.TextureLoader();
		const texture = loader.load(this.node.getAttribute('src'), (texture) => {
			texture.anisotropy = this.world.renderer.capabilities.getMaxAnisotropy();
			const material = USE_SHADER_MATERIAL ? this.getShaderMaterial(texture) : this.getMaterial(texture);
			const picture = new THREE.Mesh(geometry, material);
			if (typeof callback === 'function') {
				callback(picture);
			}
		});
	}

	getShaderMaterial(texture) {
		const material = new THREE.ShaderMaterial({
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			uniforms: {
				uImage: {
					type: 't',
					value: texture,
				},
				uOpacity: {
					type: 'f',
					value: 1
				},
				uTime: {
					type: 'f',
					value: performance.now()
				},
				uSpeed: {
					type: 'f',
					value: 0
				},
				uPow: {
					type: 'f',
					value: 0
				},
				uResolution: {
					type: 'v2',
					value: new THREE.Vector2(window.innerWidth, window.innerHeight).multiplyScalar(window.devicePixelRatio)
				},
			},
			side: THREE.DoubleSide
		});
		return material;
	}

	getMaterial(texture) {
		const material = new THREE.MeshBasicMaterial({
			map: texture,
			color: 0xffffff,
			transparent: true,
			opacity: 1.0,
			alphaTest: 0.01,
			side: THREE.DoubleSide,
		});
		return material;
	}

	loaded(picture) {
		this.picture = picture;
		picture.userData.render = (time, tick) => {
			if (this.intersection) {
				this.update(this, time, tick);
				this.render(this, time, tick);
			}
		};
		const world = this.world;
		world.scene.add(picture);
		const node = this.node;
		domService.scrollIntersection$(node).subscribe(event => {
			this.scroll = event.scroll;
			this.intersection = event.intersection;
			this.windowRect = event.windowRect;
			this.cameraRect = world.camera.cameraRect;
			this.calculateScaleAndPosition();
		});
	}

	calculateScaleAndPosition() {
		const scroll = this.scroll;
		const intersection = this.intersection;
		const windowRect = this.windowRect;
		const cameraRect = this.cameraRect;
		this.speed += (this.scroll.speed - this.speed) / 8;
		const sx = intersection.width / windowRect.width * cameraRect.width;
		const sy = intersection.height / windowRect.height * cameraRect.height;
		this.scale.set(sx, sy, 1);
		const tx = intersection.x * cameraRect.width / windowRect.width - cameraRect.width / 2;
		const ty = intersection.y * cameraRect.height / windowRect.height - cameraRect.height / 2;
		this.position.set(tx, -ty, 0);
	}

	update(domPicture, time, tick) {
		const picture = domPicture.picture;
		if (USE_SHADER_MATERIAL) {
			picture.material.uniforms.uTime.value = time;
			picture.material.uniforms.uOpacity.value = 1;
			picture.material.uniforms.uSpeed.value = domPicture.speed;
		} else {
			picture.material.opacity = 1;
		}
	}

	render(domPicture, time, tick) {
		const picture = domPicture.picture;
		const scale = domPicture.scale;
		picture.scale.set(scale.x, scale.y, scale.z);
		const position = domPicture.position;
		picture.position.set(position.x, position.y, position.z);
		const pow = domPicture.pow();
		picture.rotation.x = deg(180) * pow;
		picture.rotation.y = deg(360) * pow;
	}

	getScroll(offset) {
		const scroll = this.intersection.scroll(offset);
		// console.log(scroll);
		return scroll;
	}

	getPow(offset) {
		let pow = Math.min(0.0, this.intersection.offset(offset)) + 1;
		pow = Math.max(0.0, pow);
		pow = Ease.Sine.InOut(pow);
		pow -= 1;
		return pow;
	}

}
