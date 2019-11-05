/* jshint esversion: 6 */

import Example01 from './examples/example-01';
import Example02 from './examples/example-02';
import Example03 from './examples/example-03';
import Example04 from './examples/example-04';
import Menu from './menu/menu';
import User from './user/user';

// threejs examples

window.Example01 = Example01;
window.Example02 = Example02;
window.Example03 = Example03;
window.Example04 = Example04;

// menu example

const menu = new Menu(document.querySelector('.nav--header'));

// es6 class example

const user = new User({
	name: 'Daniel',
	surname: 'Coggins',
});

const user2 = new User();

console.log(user.fullname);
user.fullname = 'Massimo Carletti';
console.log(user.fullname);
console.log(user2.fullname);
