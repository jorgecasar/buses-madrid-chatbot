const functions = require('firebase-functions');
const Debug = require('debug');
const debug = Debug('buses-madrid:stop.stop-location:debug');
const error = Debug('buses-madrid:stop.stop-location:error');
const { Geo } = require('../emt-madrid');

const emtmadridConfig = functions.config().emtmadrid;
const bus = new Geo(emtmadridConfig.id, emtmadridConfig.key, 'es');

// Configure logging for hosting platforms that only support debug and console.error
debug.log = console.log.bind(console);
error.log = console.error.bind(console);

function handler(app){
	debug('stop.stop-location');

	let optionSelected = app.getContextArgument('actions_intent_option',
		'OPTION');

	optionSelected = optionSelected ? optionSelected.value : null;
	debug('OPTION_SELECTED', optionSelected);

	if (!optionSelected) {
		app.ask(
			app.i18n.__('stop.no-selected')
			+ app.getMoreHelpText()
		);
	} else if (optionSelected === 'INCREASE_RADIUS') {
		app.data.radius = parseInt(app.data.radius, 10);
		if (app.data.radius < 800) {
			app.ask({
				speech: 'Ampliando la búsqueda a ' + app.data.radius + ' metros',
				event: {
					name: 'actions_intent_INCREASE_RADIUS',
					data: { radius: app.data.radius }
				}
			});
		} else {
			let bus = app.getContextArgument('input', 'bus').value;
			app.ask(
				app.i18n.__('stops.stops-list.zero', {lineId: bus.lineId})
				+ app.getMoreHelpText()
			);
		}
	} else {
		let stop = app.getContextArgument('stops', optionSelected);
		if (stop) {
			stop = stop.value;
			app.setContext('input', 5, { stop: { stopId: stop.stopId }});
			app.ask(
				app.buildRichResponse()
					.addSimpleResponse(app.i18n.__('stop.direction', {
						stopId: stop.stopId,
						address: stop.postalAddress
					}) + app.getMoreHelpText())
					.addSuggestionLink(
						app.i18n.__('text.map'),
						getMapsUrl(stop.postalAddress + ', Madrid')
					)
			);
		} else {
			app.ask(
				app.i18n.__('stop.no-selected')
				+ app.getMoreHelpText()
			);
		}
	}
}

function getMapsUrl(destination) {
	const params = {
		api: 1,
		destination,
		travelmode: 'walking',
		dir_action: 'navigate'
	}
	let strParams = Object.keys(params)
		.map(key => key + '=' + params[key])
		.join('&');
	return `https://www.google.com/maps/dir/?${strParams}`;
}

module.exports = handler;
