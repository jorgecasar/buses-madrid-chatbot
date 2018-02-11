const functions = require('firebase-functions');
const Debug = require('debug');
const debug = Debug('buses-madrid:stop.bus.bus-arrive:debug');
const error = Debug('buses-madrid:stop.bus.bus-arrive:error');
const { Geo } = require('../emt-madrid');
const emtmadridConfig = functions.config().emtmadrid;
const geo = new Geo(emtmadridConfig.id, emtmadridConfig.key, 'es');

// Configure logging for hosting platforms that only support console.log and console.error
debug.log = console.log.bind(console);
error.log = console.error.bind(console);

function handler(app) {
	debug('stop.bus.bus-arrive');

	let stop = app.getArgument('stop') || app.getContextArgument('input', 'stop');
	debug('stop: ' + JSON.stringify(stop));
	stop = stop && stop.value ? stop.value : stop;
	const stopId = stop ? stop.stopId : null;
	debug('stopId: ' + stopId);
	if (stopId) {
		let bus = app.getArgument('bus') || app.getContextArgument('input', 'bus');
		debug('bus: ' + JSON.stringify(bus));
		bus = bus && bus.value ? bus.value : bus;
		const lineId = bus ? bus.lineId : null;
		debug('lineId: ' + lineId);
		return geo.arrive(stopId, lineId)
			.catch(handleError.bind(app))
			.then(handleResponse.bind(app, stopId, lineId));
	} else {
		return false;
	}
}

function handleError(err) {
	debug(err);
	this.ask(
		this.i18n.__('error.emtmadrid.generic')
		+ this.getMoreHelpText()
	);
}

function handleResponse(stopId, lineId, response) {
	debug('handleResponse: ' + JSON.stringify(response));
	let responseText;
	if (response && response.length) {
		const arrive = response[0];
		const timeToArrive = this.moment().add(arrive.busTimeLeft, 'seconds').fromNow();
		let arrivalText = 'input.stop.bus.arrival.';
		if (arrive.busTimeLeft == 0) {
			arrivalText += 'present';
		} else if (arrive.busTimeLeft < 0) {
			arrivalText += 'past';
		} else {
			arrivalText += 'future';
		}
		responseText = this.i18n.__(
			arrivalText,
			{ stopId, lineId, timeToArrive }
		);
	} else {
		responseText = this.i18n.__(
			'input.stop.bus.arrival.none',
			{ stopId: response, lineId }
		);
	}
	return this.ask(
		responseText
		+ this.getMoreHelpText()
	);
}

module.exports = handler;
