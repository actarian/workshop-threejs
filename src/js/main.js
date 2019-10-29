/* jshint esversion: 6 */

import Component from './component/component';
import Example01 from './examples/example-01';
import Example02 from './examples/example-02';
import Example03 from './examples/example-03';
import Example04 from './examples/example-04';

/*
import Mutation from './mutation/mutation';

Mutation.observe$().subscribe((event) => {
	console.log(event.added.length, event.removed.length);
	console.log(event.added);
});
*/

window.model = { message: 'works!' };

window.onOutput = ($event) => {
	console.log('window.onOutput', $event);
};

Component.watch$().subscribe(createdComponentsOrDestroyedNodes => {
	console.log(createdComponentsOrDestroyedNodes);
});

window.Example01 = Example01;
window.Example02 = Example02;
window.Example03 = Example03;
window.Example04 = Example04;
