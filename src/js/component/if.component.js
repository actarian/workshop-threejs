/* jshint esversion: 6 */

import Component from './component';

export default class IfComponent extends Component {

	constructor(node) {
		super(node);
		const if_ = this.node.getAttribute('*if');
		const source = `($instance) => { return ${if_} }`;
		const ifFunction = new Function(`with(this) {
			return (${source}).apply(this, arguments);
		}`);
		this.ifFunction = ifFunction;
		// console.log('if_', if_);
		this.node.removeAttribute('*if');
	}

	static add_if_(instance) {
		if (!instance.node.parentNode) {
			instance.ifnode.parentNode.insertBefore(instance.node, instance.ifnode.nextSibling);
		}
	}

	static remove_if_(instance) {
		if (instance.node.parentNode) {
			instance.node.parentNode.removeChild(instance.node);
		}
	}

	static update_(instance) {
		const key = instance.node.getAttribute(`instance`);
		// console.log('update_', key);
		if (!instance.ifnode) {
			instance.ifnode = document.createComment(`*if: ${instance.key_}`);
			instance.node.parentNode.replaceChild(instance.ifnode, instance.node);
		}
		const parent = this.parent_(instance.ifnode.parentNode);
		const value = instance.ifFunction.call(parent, instance);
		// console.log(value);
		if (value) {
			this.add_if_(instance);
		} else {
			this.remove_if_(instance);
		}
	}

	create() {}

	destroy() {}

}

IfComponent.meta = {
	attribute: '*if',
};
