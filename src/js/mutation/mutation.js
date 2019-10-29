/* jshint esversion: 6 */

import { fromEventPattern } from 'rxjs';
import { filter, map, shareReplay, startWith } from 'rxjs/operators';

export default class Mutation {

	static observe$() {
		let observer;
		const added = [];
		const removed = [];
		const event = { added, removed };
		return fromEventPattern((handler) => {
			const node = document.querySelector('body');
			const options = {
				childList: true,
				attributes: false,
				subtree: true
			};
			observer = new MutationObserver(handler);
			observer.observe(node, options);
		}, (handler) => {
			if (onserver) {
				observer.disconnect();
			}
		}).pipe(
			map((params) => {
				const records = params[0];
				const observer = params[1];
				added.length = 0;
				removed.length = 0;
				// records: MutationRecord[]
				records.forEach((record) => {
					for (let i = 0; i < record.addedNodes.length; i++) {
						if (record.addedNodes[i].nodeType === 1) {
							added[i] = record.addedNodes[i];
						}
					}
					for (let i = 0; i < record.removedNodes.length; i++) {
						if (record.removedNodes[i].nodeType === 1) {
							removed[i] = record.removedNodes[i];
						}
					}
					/*
					switch (record.type) {
						case 'childList':
							// One or more children have been added to and/or removed from the tree;
							// see record.addedNodes and record.removedNodes
							if (this.nodeListCountElements(record.addedNodes) > 0) {
								console.log('added', record.addedNodes);
							}
							if (this.nodeListCountElements(record.removedNodes) > 0) {
								console.log('removed', record.removedNodes);
							}
							break;
						case 'attributes':
							// An attribute value changed on the element in record.target;
							// the attribute name is in record.attributeName and its previous value is in record.oldValue
							break;
					}
					*/
				});
				return event;
			}),
			filter((event) => event.added.length || event.removed.length),
			// startWith(event),
			shareReplay()
		);
	}

	static queryAll(nodelist, attribute, results) {
		for (let i = 0; i < nodelist.length; i++) {
			if (nodelist[i].nodeType === 1) {
				if (nodelist[i].hasAttribute(attribute)) {
					results.push(nodelist[i]);
				}
				results = this.queryAll(nodelist[i].childNodes, attribute, results);
			}
		}
		return results;
	}

	static added$(attribute) {
		const added = [];
		return this.observe$().pipe(
			map(event => {
				added.length = 0;
				for (let i = 0; i < event.added.length; i++) {
					if (event.added[i].hasAttribute(attribute)) {
						added[i] = event.added[i];
					}
				}
				return added;
			}),
			// startWith([...document.querySelectorAll(`[${attribute}]`)]),
			startWith(this.queryAll(document.childNodes, attribute, [])),
			filter(added => added.length),
			shareReplay()
		);
	}

	static removed$(attribute) {
		const removed = [];
		return this.observe$().pipe(
			map(event => {
				removed.length = 0;
				for (let i = 0; i < event.removed.length; i++) {
					if (event.removed[i].hasAttribute(attribute)) {
						removed[i] = event.removed[i];
					}
				}
				return removed;
			}),
			filter(removed => removed.length),
			shareReplay()
		);
	}

	/*
	static nodeListCountElements(list) {
		let count = 0;
		for (let i = 0; i < list.length; i++) {
			const item = list[i];
			if (item.nodeType === 1) {
				count++;
			}
		}
		return count;
	}

	static callback(records, observer) {
		records.forEach((record) => {
			switch (record.type) {
				case 'childList':
					// One or more children have been added to and/or removed from the tree;
					// see record.addedNodes and record.removedNodes
				break;
				case 'attributes':
					// An attribute value changed on the element in record.target;
					// the attribute name is in record.attributeName and its previous value is in record.oldValue
				break;
				}
				console.log(record);
		});
	}

	static observe() {
		const node = document.querySelector('body');
		const options = {
			childList: true,
			attributes: false,
			subtree: true //Omit or set to false to observe only changes to the parent node.
		};
		const observer = new MutationObserver(Mutation.callback);
		observer.observe(node, options);
	}
	*/

}
