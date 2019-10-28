/* jshint esversion: 6 */

import DomService from '../dom/dom.service';
import Ease from '../ease/ease';

export default class Title {

	constructor(node) {
		return;
		this.node = node;
		const splitting = Splitting({
			target: node,
			by: 'chars',
			key: null
		})[0];
		this.splitting = splitting;
		DomService.scrollIntersection$(node, 2).subscribe(event => {
			this.update(event.intersection, event.rect, event.windowRect);
		});
	}

	update(intersection, rect, windowRect) {
		const node = this.node;
		const splitting = this.splitting;
		const h = node.offsetHeight;
		const direction = node.getAttribute('title') || 'left';
		const tweens = splitting.chars.map((char, index) => {
			let i;
			if (direction === 'left') {
				i = (splitting.chars.length - index);
			} else {
				i = index;
			}
			let pow = intersection.offset((i - splitting.chars.length) * 50);
			pow = Math.max(0, Math.min(1, pow + 1)); // to 0-1
			pow = Ease.Sine.InOut(pow);
			TweenMax.set(char, {
				x: (5 + 0.1 * i) * (h * 0.1) * (1 - pow),
				opacity: pow
			});
			// const index = getComputedStyle(char).getPropertyValue('--char-index');
		});
	}

}
