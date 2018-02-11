const functions = require('firebase-functions');
const Debug = require('debug');
const debug = Debug('buses-madrid:stop.bus-list:debug');
const error = Debug('buses-madrid:stop.bus-list:error');
const { Bus } = require('../emt-madrid');
const emtmadridConfig = functions.config().emtmadrid;
const bus = new Bus(emtmadridConfig.id, emtmadridConfig.key, 'es');

// Configure logging for hosting platforms that only support console.log and console.error
debug.log = console.log.bind(console);
error.log = console.error.bind(console);

function handler(app) {
	debug('stop.bus-list');

	const stop = app.getArgument('stop');
	let stopId = stop ? stop.stopId : null;
	if (stopId) {
		return bus.nodes(stopId)
			.catch(handleError.bind(app))
			.then(response => response[0])
			.then(handleResponse.bind(app));
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

function handleResponse(response) {
	const num_lines = response.lines.length;
	let lines = response.lines.map(item => item.label);
	const lastLine = lines.pop();
	let linesText = lines.join(this.i18n.__('text.separator.item'));
	linesText += linesText ? this.i18n.__('text.separator.and') + lastLine : lastLine;
	let responseText = this.i18n.__n(
		'stop.bus-list',
		num_lines,
		{
			stopId: response.node,
			lines: linesText
		}
	);
	return this.ask(
		responseText + this.getMoreHelpText(),
		this.i18n.__('fallback.list')
	);
}

module.exports = handler;
