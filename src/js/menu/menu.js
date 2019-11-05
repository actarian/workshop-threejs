class MenuItem {

	constructor(node) {
		this.node = node;
		this.onClick = this.onClick.bind(this);
		node.addEventListener('click', this.onClick);
		if (window.location.href.indexOf(node.getAttribute('href').replace('./', '/')) !== -1) {
			this.node.classList.add('active');
		}
	}

	onClick(event) {
		event.preventDefault();
		this.node.classList.add('active');
		setTimeout(() => {
			window.location.href = this.node.getAttribute('href');
		}, 1500);
	}

}

export default class Menu {

	constructor(node) {
		this.items = [...node.querySelectorAll('a')].map((value) => new MenuItem(value));
		console.log(this.items);
	}

}
