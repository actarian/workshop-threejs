/* jshint esversion: 6 */

export default class Rect {

	constructor(rect) {
		this.x = 0;
		this.y = 0;
		this.top = 0;
		this.right = 0;
		this.bottom = 0;
		this.left = 0;
		this.width = 0;
		this.height = 0;
		this.set(rect);
	}

	static contains(rect, left, top) {
		return rect.top <= top && top <= rect.bottom && rect.left <= left && left <= rect.right;
	}

	static intersectRect(r1, r2) {
		return !(r2.left > r1.right ||
			r2.right < r1.left ||
			r2.top > r1.bottom ||
			r2.bottom < r1.top);
	}

	static fromNode(node) {
		if (!node) {
			return;
		}
		const rect = node.rect_ || (node.rect_ = new Rect());
		const rects = node.getClientRects();
		if (!rects.length) {
			// console.log(rects, node);
			return rect;
		}
		const boundingRect = node.getBoundingClientRect();
		// rect.top: boundingRect.top + defaultView.pageYOffset,
		// rect.left: boundingRect.left + defaultView.pageXOffset,
		rect.x = boundingRect.left;
		rect.y = boundingRect.top;
		rect.top = boundingRect.top;
		rect.left = boundingRect.left;
		rect.width = boundingRect.width;
		rect.height = boundingRect.height;
		rect.right = rect.left + rect.width;
		rect.bottom = rect.top + rect.height;
		rect.setCenter();
		return rect;
	}

	set(rect) {
		if (rect) {
			Object.assign(this, rect);
			this.right = this.left + this.width;
			this.bottom = this.top + this.height;
		}
		this.setCenter();
	}

	setCenter() {
		const center = this.center || (this.center = {});
		center.top = this.top + this.height / 2;
		center.left = this.left + this.width / 2;
		center.x = center.left;
		center.y = center.top;
	}

	contains(left, top) {
		return Rect.contains(this, left, top);
	}

	intersect(rect) {
		return Rect.intersectRect(this, rect);
	}

	intersection(rect, mode = 1) {
		const intersection = this.intersection_ || (this.intersection_ = {
			left: 0,
			top: 0,
			width: 0,
			height: 0,
			x: 0,
			y: 0,
			pow: {
				x: -1,
				y: -1
			},
			offset: function(offset, mode) {
				offset = offset || 0;
				let min, max;
				if (mode === 1) {
					min = -this.height;
					max = this.rect.height + this.height;
				} else {
					min = this.rect.height * 0.1;
					max = this.rect.height - this.height;
				}
				let pow = 0.5 - (this.top + offset - min) / max;
				// pow = Math.max(0, Math.min(1, pow));
				return pow;
			},
			scroll: function(offset) {
				offset = offset || 0;
				let min, max;
				min = -this.height;
				max = this.rect.height + this.height;
				let scroll = 0.5 - (this.top + offset - min) / max;
				// scroll = Math.max(0, Math.min(1, scroll));
				return scroll + 0.5;
			}
		});
		intersection.left = this.left;
		intersection.top = this.top;
		intersection.width = this.width;
		intersection.height = this.height;
		intersection.x = this.left + this.width / 2;
		intersection.y = this.top + this.height / 2;
		intersection.rect = rect;
		const pow = intersection.offset(0, mode);
		intersection.pow.y = pow;
		return intersection;
	}

	intersection___(rect) {
		const center = {
			x: (this.center.x - rect.center.x) / (rect.width / 2),
			y: (this.center.y - rect.center.y) / (rect.height / 2),
		};
		if (this.intersect(rect)) {
			const dx = this.left > rect.left ? 0 : Math.abs(rect.left - this.left);
			const dy = this.top > rect.top ? 0 : Math.abs(rect.top - this.top);
			let x = dx ? (1 - dx / this.width) : ((rect.left + rect.width) - this.left) / this.width;
			let y = dy ? (1 - dy / this.height) : ((rect.top + rect.height) - this.top) / this.height;
			x = Math.min(1, x);
			y = Math.min(1, y);
			return {
				x: x,
				y: y,
				center: center
			};
		} else {
			return { x: 0, y: 0, center: center };
		}
	}

}
