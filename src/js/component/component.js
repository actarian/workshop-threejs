/* jshint esversion: 6 */

import { merge, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import Mutation from '../mutation/mutation';

const DEFAULT_META = {
	attribute: 'component',
	inputs: ['input'],
	outputs: ['output'],
};

const STORE = {
	INSTANCE: {},
	INPUT: {},
	OUTPUT: {},
};

let INDEX = 0;

export default class Component {

	constructor(node) {
		this.node = node;
	}

	create() {
		// this.node.innerHTML = 'Component';
		// this.node.style.background = 'rgba(255,0,0,0.1)';
		// console.log('Component.create', this.inputs_());
		/*
		setInterval(() => {
			this.output.next({ message: this.key_ });
		}, 1500);
		*/
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
		const index = ++INDEX; // Object.keys(STORE.INSTANCE).length;
		const key = `${meta.attribute}-${index}`;
		const instance = new this(node);
		instance.key_ = key;
		instance.unsubscribe = new Subject();
		if (meta.attribute.indexOf('*') === 0) {
			this.update_(instance);
			return instance;
		}
		node.setAttribute(`instance`, key);
		const inputs = meta.inputs;
		if (inputs) {
			inputs.forEach(input => {
				STORE.INPUT[`${key}-${input}`] = this.make_input_(instance, input);
			});
		}
		instance.inputs_ = () => {
			const inputs_ = {};
			if (inputs) {
				inputs.forEach(input => inputs_[input] = instance[input]);
			}
			return inputs_;
		};
		const outputs = meta.outputs;
		if (outputs) {
			outputs.forEach(output => {
				STORE.OUTPUT[`${key}-${output}`] = this.make_output_(instance, output);
				instance[output].pipe(
					takeUntil(instance.unsubscribe)
				).subscribe();
			});
		}
		this.update_(instance);
		if (typeof instance.create === 'function') {
			instance.create();
		}
		STORE.INSTANCE[key] = instance;
		return instance;
	}

	static remove_(node) {
		const meta = this.meta || DEFAULT_META;
		const key = node.getAttribute(`instance`);
		const instance = STORE.INSTANCE[key];
		instance.unsubscribe.next();
		instance.unsubscribe.complete();
		if (typeof instance.destroy === 'function') {
			instance.destroy();
		}
		delete STORE.INSTANCE[key];
		const inputs = meta.inputs;
		if (inputs) {
			inputs.forEach(input => {
				delete STORE.INPUT[`${key}-${input}`];
			});
		}
		const outputs = meta.outputs;
		if (outputs) {
			outputs.forEach(output => {
				delete STORE.OUTPUT[`${key}-${output}`];
			});
		}
		return node;
	}

	static update_(instance) {
		const key = instance.node.getAttribute(`instance`);
		const meta = this.meta || DEFAULT_META;
		const inputs = meta.inputs;
		if (inputs) {
			inputs.forEach(input => {
				const value = this.call_input_(instance, STORE.INPUT[`${key}-${input}`]);
				instance[input] = value;
			});
		}
		this.parse_(instance.node, instance);
		/*
		const outputs = meta.outputs;
		if (outputs) {
			outputs.forEach(output => {
				const value = this.call_output_(instance, STORE.OUTPUT[`${key}-${output}`]);
				console.log(`setted -> ${output}`, value);
			});
		}
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
		const parse_replace_ = function(text) {
			return text.replace(new RegExp('\{\{(?:\\s+)?(.*)(?:\\s+)?\}\}'), parse_eval_);
		}
		if (node.hasAttribute('[bind]')) {
			const bind = `{{${node.getAttribute('[bind]')}}}`;
			node.innerHTML = parse_replace_(bind);
		} else if (node.hasAttribute('bind')) {
			const bind = node.getAttribute('bind');
			node.innerHTML = parse_replace_(bind);
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
					const replacedText = parse_replace_(text);
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
			const instance = STORE.INSTANCE[key];
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
