const functions = require('firebase-functions');
const Debug = require('debug');
const debug = Debug('buses-madrid:bus.location.stop-list:debug');
const error = Debug('buses-madrid:bus.location.stop-list:error');
const { Geo } = require('../emt-madrid');

const emtmadridConfig = functions.config().emtmadrid;
const geo = new Geo(emtmadridConfig.id, emtmadridConfig.key, 'es');

// Configure logging for hosting platforms that only support console.log and console.error
debug.log = console.log.bind(console);
error.log = console.error.bind(console);

function handler(app){
	debug('bus.location.stop-list');
	if (app.isPermissionGranted()) {
		app.data.radius = 500;
		findStops(app);
	} else {
		if (app.getContextArgument('actions_intent_increase_radius', 'radius')) {
			app.data.radius = parseInt(app.data.radius, 10) + 150;
			findStops(app);
		} else {
			handlePermissionNotGranted(app);
		}
	}
}

function findStops(app) {
	app.data.coordinates = app.getDeviceLocation().coordinates;
	let {latitude, longitude} = app.data.coordinates;
	debug(`coordinates ${latitude}, ${longitude}`);
	let bus = app.getContextArgument('input', 'bus');
	bus = bus && bus.value ? bus.value : null;

	app.timeout = setTimeout(() => {
		clearTimeout(app.timeout);
		error('EMT Timeout');
		app.tell(app.i18n.__('error.emtmadrid.timeout'));
	}, 5000);
	geo.stops({ latitude, longitude }, bus.lineId, app.data.radius)
		.then(response => {
			clearTimeout(app.timeout);
			return response;
		})
		.then(findPairStops.bind(app, bus.lineId))
		.then(buildResponse.bind(app, bus.lineId));
}

function handlePermissionNotGranted(app) {
	app.ask(
		app.i18n.__('error.location.notGranted')
		+ app.getMoreHelpText()
	);
}

function findPairStops(lineId, stops) {
	let i = 0;
	let stopTo = {};
	while (!(stopTo.A && stopTo.B) && i < stops.length) {
		let lines = stops[i].line;
		let j = 0;
		while (!(stopTo.A && stopTo.B) && j < lines.length) {
			let direction = lines[j].direction;
			if (!stopTo[direction] && lines[j].line == lineId) {
				stopTo[direction] = stops[i];
				stopTo[direction].direction = lines[j][`header${direction}`];
			}
			j++;
		}
		i++;
	}
	debug(`stopTo ${JSON.stringify(stopTo)}`);
	return stopTo;
}

function buildResponse(lineId, stopTo) {
	const app = this;
	console.log('stopTo', stopTo);
	if (stopTo.A && stopTo.B) {
		const list = buildClosestStopsList(app, lineId, stopTo);
		const stopListText = app.i18n.__n('stops.stops-list', 2, {
			lineId,
			radius: app.data.radius
		});
		const listToSpeech = app.i18n.__('bus.directions', {
			directionA: stopTo.A.direction,
			directionB: stopTo.B.direction,
		});
		const endQuestion = app.i18n.__('stops.what-direction');
		app.askWithList(
			{
				speech: `${stopListText} ${listToSpeech} ${endQuestion}`,
				displayText: `${stopListText} ${endQuestion}`,
			},
			list
		);
	} else if (stopTo.A || stopTo.B) {
		const list = buildClosestStopsList(app, lineId, stopTo);
		list.addItems(
			app.buildOptionItem(
				'INCREASE_RADIUS',
				app.i18n.__('stops.increase-radius')
			)
			.setTitle(app.i18n.__('stops.increase-radius')[0])
		);
		app.askWithList(
			app.i18n.__n('stops.stops-list', 1, {
				lineId,
				radius: app.data.radius
			}),
			list
		);
	} else {
		app.ask(
			app.i18n.__('stops.stops-list.none', { lineId, radius: app.data.radius})
			+ this.getMoreHelpText()
		);
	}
}

function buildClosestStopsList(app, lineId, stopTo) {
	const list = app.buildList(`Paradas del autobús ${lineId} más cercanas`);
	const headers = Object.keys(stopTo);
	let stopsContext = {};
	for (let head of headers) {
		if (stopTo[head]) {
			let stop = stopTo[head]
			let direction = stop.direction;
			let title = app.i18n.__('bus.direction-stop-id', {
				direction, stopId: stop.stopId
			});
			stopsContext[head] = {
				stopId: stop.stopId,
				postalAddress: stop.postalAddress
			};
			list.addItems(
				app.buildOptionItem(
					head,
					[stop.stopId, `${stop.name}`, title, direction]
				)
				.setTitle(title)
				.setDescription(`${stop.postalAddress} (${stop.name})`)
			);
		}
	}
	app.setContext('stops', 2, stopsContext);
	return list;
}

module.exports = handler;
