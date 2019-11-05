/* jshint esversion: 6 */

export default class User {

	constructor(options) {
		this.name = 'Luca';
		this.surname = 'Zampetti';
		if (options) {
			Object.assign(this, options);
		}
	}

	getFullName() {
		return `${this.name} ${this.surname}`;
		// return this.name + ' ' + this.surname;
	}

	get fullname() {
		return `${this.name} ${this.surname}`;
		// return this.name + ' ' + this.surname;
	}

	set fullname(fullname) {
		this.name = fullname.split(' ')[0];
		this.surname = fullname.split(' ')[1];
	}

}
