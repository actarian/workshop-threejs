/* jshint esversion: 6 */

import { merge, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import Mutation from '../mutation/mutation';

const store = {
	instances: {},
	inputs: {},
	outputs: {},
};

const DEFAULT_META = {
	attribute: 'component',
	inputs: ['input'],
	outputs: ['output'],
};

export default class Component {

	constructor(node) {
		this.node = node;
	}

	create() {
		// this.node.innerHTML = 'Component';
		// this.node.style.background = 'rgba(255,0,0,0.1)';
		// console.log('Component.create', this.inputs_());
		setInterval(() => {
			this.output.next({ message: this.key_ });
		}, 1500);
	}

	destroy() {
		// console.log('Component.destroy');
	}

	static watch$() {
		const meta = this.meta || DEFAULT_META;
		return merge(
			Mutation.added$(meta.attribute).pipe(
				map((added) => {
					return added.map(node => this.add_(node));
				})
			),
			Mutation.removed$(meta.attribute).pipe(
				map((removed) => {
					return removed.map(node => this.remove_(node));
				})
			));
	}

	static add_(node) {
		const meta = this.meta || DEFAULT_META;
		const index = Object.keys(store.instances).length;
		const key = `${meta.attribute}-${index}`;
		node.setAttribute(`instance`, key);
		const instance = new this(node);
		instance.key_ = key;
		instance.unsubscribe = new Subject();
		const inputs = meta.inputs;
		inputs.forEach(input => {
			store.inputs[`${key}-${input}`] = this.make_input_(instance, input);
		});
		instance.inputs_ = () => {
			const inputs_ = {};
			inputs.forEach(input => inputs_[input] = instance[input]);
			return inputs_;
		};
		const outputs = meta.outputs;
		outputs.forEach(output => {
			store.outputs[`${key}-${output}`] = this.make_output_(instance, output);
			instance[output].pipe(
				takeUntil(instance.unsubscribe)
			).subscribe();
		});
		this.update_(instance);
		if (typeof instance.create === 'function') {
			instance.create();
		}
		store.instances[key] = instance;
		return instance;
	}

	static remove_(node) {
		const meta = this.meta || DEFAULT_META;
		const key = node.getAttribute(`instance`);
		const instance = store.instances[key];
		instance.unsubscribe.next();
		instance.unsubscribe.complete();
		if (typeof instance.destroy === 'function') {
			instance.destroy();
		}
		delete store.instances[key];
		const inputs = meta.inputs;
		inputs.forEach(input => {
			delete store.inputs[`${key}-${input}`];
		});
		const outputs = meta.outputs;
		outputs.forEach(output => {
			delete store.outputs[`${key}-${output}`];
		});
		return node;
	}

	static update_(instance) {
		const key = instance.node.getAttribute(`instance`);
		const meta = this.meta || DEFAULT_META;
		const inputs = meta.inputs;
		inputs.forEach(input => {
			const value = this.call_input_(instance, store.inputs[`${key}-${input}`]);
			instance[input] = value;
		});
		this.parse_(instance.node, instance);
		/*
		const outputs = meta.outputs;
		outputs.forEach(output => {
			const value = this.call_output_(instance, store.outputs[`${key}-${output}`]);
			console.log(`setted -> ${output}`, value);
		});
		*/
	}

	static parse_(node, instance) {
		// console.log('node', node.childNodes.length, node);
		const parse_eval_ = function(...args) {
			// console.log('parse_eval_', args[1]);
			const source = `($instance) => { return ${args[1]} }`;
			return new Function(`with(this) {
				return (${source}).apply(this, arguments);
			}`).call(instance);
		};
		const bind = node.getAttribute('bind');
		if (bind !== null) {
			node.innerHTML = bind.replace(new RegExp('\{\{(?:\\s+)?(.*)(?:\\s+)?\}\}'), parse_eval_);
		} else {
			for (let i = 0; i < node.childNodes.length; i++) {
				const child = node.childNodes[i];
				// console.log('node', child, child.nodeType);
				if (child.nodeType === 1) {
					if (!child.hasAttribute(`instance`)) {
						this.parse_(child, instance);
					}
				} else if (child.nodeType === 3) {
					// console.log(child);
					const text = child.nodeValue;
					const replacedText = text.replace(new RegExp('\{\{(?:\\s+)?(.*)(?:\\s+)?\}\}'), parse_eval_);
					if (text !== replacedText) {
						node.setAttribute('bind', text);
						const textNode = document.createTextNode(replacedText);
						node.replaceChild(textNode, child);
					}
				}
			}
		}
	}

	static make_input_(instance, attribute) {
		const input = instance.node.getAttribute(`[${attribute}]`);
		const source = `($instance) => { return ${input} }`;
		const inputFunction = new Function(`with(this) {
			return (${source}).apply(this, arguments);
		}`);
		return inputFunction;
	}

	static make_output_(instance, attribute) {
		const output = instance.node.getAttribute(`(${attribute})`);
		const source = `($event) => { return ${output} }`;
		const outputFunction = new Function(`with(this) {
			return (${source}).apply(this, arguments);
		}`);
		// const $event = { message: 'yo' };
		instance[attribute] = new Subject().pipe(tap((event) => this.call_output_(instance, outputFunction, event)));
		return outputFunction;
	}

	static call_input_(instance, inputFunction) {
		const parent = this.parent_(instance.node.parentNode);
		const inputValue = inputFunction.call(parent, instance);
		// console.log(inputValue);
		return inputValue;
	}

	static call_output_(instance, outputFunction, event) {
		const parent = this.parent_(instance.node.parentNode);
		const outputValue = outputFunction.call(parent, event);
		// console.log(outputValue);
		return outputValue;
	}

	static parent_(node) {
		if (node === document) {
			return window;
		}
		const key = node.getAttribute(`instance`);
		if (key !== undefined) {
			const instance = store.instances[key];
			return instance;
		} else if (node.parentNode) {
			return this.parent_(node.parentNode);
		}
	}

	/*
	static watch_() {
		const meta = this.meta || DEFAULT_META;

		Mutation.added$(meta.attribute).subscribe((added) => {
			added.forEach(node => this.add_(node));
		});

		Mutation.removed$(meta.attribute).subscribe((removed) => {
			removed.forEach(node => this.remove_(node));
		});
	}

	static input_(instance, attribute) {
		const input = instance.node.getAttribute(`[${attribute}]`);
		const source = `($instance) => { return ${input} }`;
		const parent = this.parent_(instance.node.parentNode);
		const inputValue = new Function(`with(this) {
			return (${source}).apply(this, arguments);
		}`).call(parent, instance);
		// const inputValue = eval(input);
		console.log(input, source, inputValue);
	}

	static output_(instance, attribute) {
		const $event = { message: 'yo' };
		const output = instance.node.getAttribute(`(${attribute})`);
		const source = `($event) => { return ${output} }`;
		const outputValue = new Function(`return (${source}).apply(this, arguments)`).call(null, $event);
		// const outputValue = eval(output);
		console.log(output, source, outputValue);
	}

	static parse_try_replace_(text, find, replace) {
		if ((/[a-zA-Z\_]+/g).test(text)) {
			return text.replace(new RegExp('\{\{(?:\\s+)?(' + find + ')(?:\\s+)?\}\}'), replace);
		} else {
			throw new Error("Find statement does not match regular expression: /[a-zA-Z\_]+/");
		}
	}

	*/

}
