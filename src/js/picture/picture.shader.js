/* jshint esversion: 6 */

import { PlaneGeometry } from '../plane/plane';
import Texture from '../texture/texture';
import Picture from './picture';

export const DEFAULT_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
uniform float uOpacity;
uniform float uTime;
uniform float uPow;
uniform float uSpeed;
uniform sampler2D uImage;
uniform sampler2D uNoise;
void main() {
	vUv = uv;
	vec3 vPosition = position;
	float s = uSpeed * -0.05;
	/*
	float pow = clamp(uPow + 0.5, 0.0, 1.0);
	vec4 color = texture2D(uImage, vUv);
	vPosition.y += cos(uv.x + color.r * pow - 0.5) * s - s;
	*/
	vPosition.y += cos(uv.x - 0.5) * s - s;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(vPosition, 1.0);
}
`;

export const DEFAULT_FRAGMENT_SHADER = /* glsl */ `
varying vec2 vUv;
uniform float uOpacity;
uniform float uTime;
uniform float uPow;
uniform float uSpeed;
uniform sampler2D uImage;
uniform sampler2D uNoise;
void main() {
	float pow = clamp(uPow + 0.5, 0.0, 1.0);
	/*
	float s = uSpeed * -0.05;
	vec2 p = vec2(vUv.x + cos(vUv.x - 0.5 + s) * s * (1.0 - pow), vUv.y + sin(vUv.y * 0.1 - 0.5 + s) * s * (1.0 - pow));
	vec4 color = texture2D(uImage, p);
	*/
	vec4 color = texture2D(uImage, vUv);

	float r = (1.0 - texture2D(uNoise, vUv).r);
    r = 1.0 - smoothstep(pow, pow + 0.1, r);
    r = clamp(r, 0.0, 1.0);

	color.a *= uOpacity * r;
	// if (color.a < 0.001) discard;
	// gl_FragColor = mix(vec4(1.0, 1.0, 1.0, color.a), color, pow);
	gl_FragColor = color;
	gl_FragColor.rgb *= gl_FragColor.a;
}
`;

export default class PictureShader extends Picture {

	constructor(node, options) {
		options.vertexShader = options.vertexShader || DEFAULT_VERTEX_SHADER;
		options.fragmentShader = options.fragmentShader || DEFAULT_FRAGMENT_SHADER;
		super(node, options);
	}

	create(callback) {
		Texture.loadMany$([this.node.getAttribute('picture'), 'three/noise/noise-01.png'], this.world.renderer).subscribe(textures => {
			const texture = textures[0];
			this.node.style.paddingBottom = `${texture.image.naturalHeight / texture.image.naturalWidth * 100}%`;
			const material = this.getMaterial(textures);
			const mesh = new THREE.Mesh(PlaneGeometry, material);
			mesh.renderOrder = 2;
			if (typeof callback === 'function') {
				callback(mesh);
			}
		});
	}

	getMaterial(textures) {
		const vertexShader = this.vertexShader;
		const fragmentShader = this.fragmentShader;
		const material = new THREE.ShaderMaterial({
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			uniforms: {
				uImage: {
					type: 't',
					value: textures[0],
				},
				uNoise: {
					type: 't',
					value: textures[1],
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
			transparent: true,
			side: THREE.DoubleSide
		});
		return material;
	}

	update(instance, time, tick) {
		const mesh = instance.mesh;
		const pow = instance.intersection.offset();
		mesh.material.uniforms.uTime.value = time;
		mesh.material.uniforms.uOpacity.value = 1;
		mesh.material.uniforms.uSpeed.value = instance.speed;
		mesh.material.uniforms.uPow.value = pow;
	}

}
