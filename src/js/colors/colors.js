/* jshint esversion: 6 */

export const colors = [
	{
		name: 'Pink',
		hex: '#f2c5d2',
		brand: 'Springhill Opaque'
	},
	{
		name: 'Canary',
		hex: '#e5bb57',
		brand: 'Springhill Opaque'
	},
	{
		name: 'Orchid',
		hex: '#9c96cd',
		brand: 'Springhill Opaque'
	},
	{
		name: 'Pastel Green',
		hex: '#76b995',
		brand: 'Springhill Opaque'
	},
	{
		name: 'Pastel Blue',
		hex: '#70a7c5',
		brand: 'Springhill Opaque'
	},
	{
		name: 'Ivory',
		hex: '#f8e6d1',
		brand: 'Springhill Opaque'
	},
	{
		name: 'Tan',
		hex: '#dfbcab',
		brand: 'Springhill Opaque'
	},
	{
		name: 'Warm White',
		hex: '#f1e7e1',
		brand: 'Mohawk VIA Vellum'
	},
	{
		name: 'Bright White',
		hex: '#efedf6',
		brand: 'Mohawk VIA Vellum'
	},
	{
		name: 'White',
		hex: '#e1dce9',
		brand: 'Rolland Enviro Copy'
	},
	{
		name: 'Gray',
		hex: '#cdcad5',
		brand: 'Earthchoice'
	},
	{
		name: 'Bright White',
		hex: '#f2f2f2',
		brand: 'Hahnemühle Photo Rag'
	}
  ];

export function hexToInt(hex) {
	return parseInt(hex.replace(/^#/, ''), 16);
}

export function randomHex() {
	return colors[Math.floor(Math.random() * colors.length)].hex;
}

export function randomColor() {
	const hex = randomHex();
	return hexToInt(hex);
}

let index = -1;

export function nextHex() {
	index++;
	return colors[index % colors.length].hex;
}

export function nextColor() {
	const hex = nextHex();
	return hexToInt(hex);
}
