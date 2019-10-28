/* jshint esversion: 6 */

import Mutation from '../mutation/mutation';

export default class Component {

	static selector = 'component';

	constructor(node) {
		this.node = node;
		const input = node.getAttribute('[input]');
		const inputValue = eval(input);
		console.log(input, inputValue);

		const output = node.getAttribute('(output)');

		// Code you want to evaluate
		const code = `return ${output}`;
		// What you want "this" bound to:
		const scope = { $event: 100 };
		// Now do this:
		const outputValue = new Function(code).call(scope);

		// const outputValue = eval(output);
		console.log(output, outputValue);

	}

	init() {
		console.log('Component.init');
		this.node.innerHTML = 'Component';
		this.node.style.background = 'rgba(255,0,0,0.1)';
	}

	destroy() {
		console.log('Component.destroy');
	}

	static init() {
		// console.log(this.selector);

		const store = {
			instances: {},
		};

		Mutation.added$(this.selector).subscribe((added) => {
			added.forEach(node => {
				const index = Object.keys(store.instances).length;
				const key = `${this.selector}-${index}`;
				node.setAttribute(this.selector, key);
				const instance = new this(node);
				if (typeof instance.init === 'function') {
					instance.init();
				}
				store.instances[key] = instance;
			});
			/*
			console.log(added.length);
			console.log(added);
			*/
		});

		Mutation.removed$(this.selector).subscribe((removed) => {
			removed.forEach(node => {
				const key = node.getAttribute(this.selector);
				const instance = store.instances[key];
				if (typeof instance.destroy === 'function') {
					instance.destroy();
				}
				delete store.instances[key];
			});
			/*
			console.log(removed.length);
			console.log(removed);
			*/
		});

	}

}
