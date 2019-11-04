/* jshint esversion: 6 */

import { randomColor } from '../colors/colors';
import Helper from '../helper/helper';

export default class Example01 {

	constructor(container) {

		this.container = container;

		// SCENE
		const scene = this.scene = new THREE.Scene();
		scene.background = new THREE.Color(randomColor());
		// scene.fog = new THREE.Fog(scene.background, 0, 50);

		// CAMERA
		const camera = this.camera = new THREE.PerspectiveCamera(75, container.offsetWidth / container.offsetHeight, 0.01, 2000);
		camera.position.set(0, 0, 5);
		camera.target = new THREE.Vector3();
		camera.zoom = 1;
		camera.updateProjectionMatrix();
		scene.add(camera);

		// RENDERER
		const renderer = this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			// alpha: true,
			// premultipliedAlpha: true,
			// preserveDrawingBuffer: false,
		});
		renderer.setClearColor(randomColor(), 1);
		renderer.setPixelRatio(window.devicePixelRatio);
		container.appendChild(renderer.domElement);

		// LISTENERS
		this.addListeners();

		// ANIMATION LOOP
		this.animate();

		// LIGHT
		// const light = new THREE.AmbientLight(randomColor(), 1);
		// const light = new THREE.DirectionalLight(randomColor(), 1);
		// const light = new THREE.HemisphereLight(randomColor(), randomColor(), 1);
		const light = new THREE.PointLight(randomColor(), 1);
		// const light = new THREE.RectAreaLight(randomColor(), 1, 2, 2);
		// const light = new THREE.SpotLight(randomColor(), 1, 0.01, Math.PI / 2, 0, 1);
		light.position.set(1, 1, 1);
		if (light instanceof THREE.DirectionalLight ||
			light instanceof THREE.RectAreaLight) {
			light.lookAt(0, 0, 0);
		}
		scene.add(light);

		const helper = Helper.make(light);
		/*
		if (helper) {
			scene.add(helper);
		}
		*/

		/*
		light.userData.render = (time, tick) => {
			light.position.x = Math.cos(tick * Math.PI / 180) * 10;
			if (light instanceof THREE.DirectionalLight ||
				light instanceof THREE.RectAreaLight) {
				light.lookAt(0, 0, 0);
			}
			if (helper) {
				helper.update();
			}
		};
		*/

		// MATERIAL
		/*
		const material = new THREE.MeshBasicMaterial({
			color: randomColor(),
			wireframe: true
		});
		*/
		/*
		const material = new THREE.MeshPhongMaterial({
			color: randomColor(),
			wireframe: false,
			flatShading: false,
		});
		*/
		const material = new THREE.MeshStandardMaterial({
			color: randomColor(),
			roughness: 0.01,
			metalness: 0.4,
		});
		/*
		const material = new THREE.MeshMatcapMaterial({
			color: randomColor(),
			matcap: new THREE.TextureLoader().load(`./three/matcap/matcap-02.jpg`, (texture) => {
				console.log('texture loaded!', texture)
			})
		});
		*/

		// MODEL
		const geometry = new THREE.BoxGeometry(1, 1, 1); // BoxGeometry(width : Float, height : Float, depth : Float, widthSegments : Integer, heightSegments : Integer, depthSegments : Integer)
		// const geometry = new THREE.CircleGeometry(0.3, 4, 0, 2 * Math.PI); // CircleGeometry(radius : Float, segments : Integer, thetaStart : Float, thetaLength : Float);
		// const geometry = new THREE.ConeGeometry(); // ConeGeometry(radius : Float, height : Float, radialSegments : Integer, heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)
		// const geometry = new THREE.CylinderGeometry(); // CylinderGeometry(radiusTop : Float, radiusBottom : Float, height : Float, radialSegments : Integer, heightSegments : Integer, openEnded : Boolean, thetaStart : Float, thetaLength : Float)
		// const geometry = new THREE.DodecahedronGeometry(); // DodecahedronGeometry(radius : Float, detail : Integer)
		// const geometry = new THREE.IcosahedronGeometry(1, 1); // IcosahedronGeometry(radius : Float, detail : Integer)
		// const geometry = new THREE.OctahedronGeometry(); // OctahedronGeometry(radius : Float, detail : Integer)
		// const geometry = new THREE.PlaneGeometry(); // PlaneGeometry(width : Float, height : Float, widthSegments : Integer, heightSegments : Integer)
		// const geometry = new THREE.RingGeometry(); // RingGeometry(innerRadius : Float, outerRadius : Float, thetaSegments : Integer, phiSegments : Integer, thetaStart : Float, thetaLength : Float)
		// const geometry = new THREE.SphereGeometry(1, 72, 36); // SphereGeometry(radius : Float, widthSegments : Integer, heightSegments : Integer, phiStart : Float, phiLength : Float, thetaStart : Float, thetaLength : Float)
		// const geometry = new THREE.TetrahedronGeometry(); // TetrahedronGeometry(radius : Float, detail : Integer)
		// const geometry = new THREE.TorusGeometry(); // TorusGeometry(radius : Float, tube : Float, radialSegments : Integer, tubularSegments : Integer, arc : Float)
		// const geometry = new THREE.TorusKnotGeometry(); // TorusKnotGeometry(radius : Float, tube : Float, tubularSegments : Integer, radialSegments : Integer, p : Integer, q : Integer)
		const cube = new THREE.Mesh(geometry, material);
		cube.userData.render = (time, tick) => {
			cube.rotation.x += 0.01;
			cube.rotation.y += 0.01;
		};
		scene.add(cube);

	}

	addListeners() {
		const resize = this.resize = this.resize.bind(this);
		window.addEventListener('resize', resize, false);
		resize();
	}

	resize() {
		try {
			const container = this.container;
			const w = container.offsetWidth;
			const h = container.offsetHeight;
			const renderer = this.renderer;
			renderer.setSize(w, h);
			const camera = this.camera;
			camera.aspect = w / h;
			camera.updateProjectionMatrix();

		} catch (error) {
			console.error('error', error);
		}
	}

	render() {
		try {
			const time = performance.now();
			const tick = this.tick_ ? ++this.tick_ : this.tick_ = 1;
			const scene = this.scene;
			scene.children.forEach(x => {
				if (typeof x.userData.render === 'function') {
					x.userData.render(time, tick);
				}
			});
			const camera = this.camera;
			const renderer = this.renderer;
			renderer.render(scene, camera);
		} catch (error) {
			console.error('error', error);
		}
	}

	animate() {
		const renderer = this.renderer;
		renderer.setAnimationLoop(() => {
			this.render();
		});
	}

}
