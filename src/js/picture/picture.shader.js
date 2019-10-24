/* jshint esversion: 6 */

import Picture from './picture';

export const DEFAULT_VERTEX_SHADER = /* glsl */ `
varying vec2 vUv;
uniform float uOpacity;
uniform float uTime;
uniform float uPow;
uniform float uSpeed;
uniform sampler2D uImage;
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
void main() {
	float pow = clamp(uPow + 0.5, 0.0, 1.0);
	float s = uSpeed * -0.05;
	vec2 p = vec2(vUv.x + cos(vUv.x - 0.5 + s) * s * (1.0 - pow), vUv.y + sin(vUv.y * 0.1 - 0.5 + s) * s * (1.0 - pow));
	vec4 color = texture2D(uImage, p);
	// vec4 color = texture2D(uImage, vUv);
	color.a *= uOpacity;
	if (color.a < 0.01) discard;
	gl_FragColor = mix(vec4(1.0, 1.0, 1.0, color.a), color, pow);
	gl_FragColor.rgb *= gl_FragColor.a;
}
`;

export default class PictureShader extends Picture {

	constructor(node, options) {
		options.vertexShader = options.vertexShader || DEFAULT_VERTEX_SHADER;
		options.fragmentShader = options.fragmentShader || DEFAULT_FRAGMENT_SHADER;
		super(node, options);
	}

	getMaterial(texture) {
		const vertexShader = this.vertexShader;
		const fragmentShader = this.fragmentShader;
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

	update(instance, time, tick) {
		const mesh = instance.mesh;
		const pow = instance.intersection.offset();
		mesh.material.uniforms.uTime.value = time;
		mesh.material.uniforms.uOpacity.value = 1;
		mesh.material.uniforms.uSpeed.value = instance.speed;
		mesh.material.uniforms.uPow.value = pow;
	}

}
