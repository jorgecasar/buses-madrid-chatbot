const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const EMTMadridLib = require('emtmadrid-lib');

function InputStopHandler(app) {
	console.log('InputStopHandler');

	const stop = app.getArgument('stop') || app.getContextArgument('input', 'bus');
	let stopId = stop ? stop.stopId : null;
	if (!stopId) {
		const param = app.getSelectedOption();
		if (param) {
			stopId = param;
		} else {
			return;
		}
	}

	let bus = app.getArgument('bus') || app.getContextArgument('input', 'bus');
	if (bus) {
		if (bus.value) {
			bus = bus.value;
		}
	} else {
		bus = app.userStorage.input ? app.userStorage.input.bus : null;
	}
	app.userStorage.input = app.data;

	const lineId = bus ? bus.lineId : null;
	const emtmadridConfig = functions.config().emtmadrid;
	const emtMadrid = new EMTMadridLib(emtmadridConfig.id, emtmadridConfig.key, 'es');

	return  emtMadrid.geoGetArriveStop({idStop: stopId})
	.catch(err => {
		console.error(err);
		app.tell(app.i18n.__('error.emtmadrid.generic'));
	})
	.then(JSON.parse)
	.then(response => {
		let fulfillmentText;
		const arrives = groupByKey(response.arrives, 'lineId');
		if (lineId) {
			if (arrives[lineId]) {
				const arrive = arrives[lineId][0];
				const timeToArrive = app.moment().add(arrive.busTimeLeft, 'seconds').fromNow();
				let arrivalText = 'input.stop.bus.arrival.';
				if (arrive.busTimeLeft == 0) {
					arrivalText += 'present';
				} else if (arrive.busTimeLeft < 0) {
					arrivalText += 'past';
				} else {
					arrivalText += 'future';
				}
				fulfillmentText = app.i18n.__(
					arrivalText,
					{ stopId, lineId, timeToArrive }
				);
			} else {
				fulfillmentText = app.i18n.__(
					'input.stop.bus.arrival.none',
					{ stopId, lineId }
				);
			}
		} else {
			const lines = Object.keys(arrives);
			switch(lines.length) {
				case 0:
					fulfillmentText = app.i18n.__n(
						'input.stop.arrival',
						lines.length,
						{ stopId }
					);
				break;
				case 1:
					const lineId = lines[0];
					const arrive = arrives[lineId][0];
					const timeToArrive = app.moment().add(arrive.busTimeLeft, 'seconds').fromNow();
					fulfillmentText = app.i18n.__n(
						'input.stop.arrival',
						lines.length,
						{ stopId, lineId, timeToArrive }
					);
					break;
				default:
					fulfillmentText = app.i18n.__n(
						'input.stop.arrival',
						lines.length,
						{ stopId }
					);
					fulfillmentText += '<break time="200ms"/>';
					const busesArriveTexts = [];
					for(let lineId of lines) {
						const arrive = arrives[lineId][0];
						const timeToArrive = app.moment().add(arrive.busTimeLeft, 'seconds').fromNow();
						let arrivalText = 'input.stop.bus.arrivalShort.';
						if (arrive.busTimeLeft == 0) {
							arrivalText += 'present';
						} else if (arrive.busTimeLeft < 0) {
							arrivalText += 'past';
						} else {
							arrivalText += 'future';
						}
						busesArriveTexts.push(app.i18n.__(
							arrivalText,
							{ stopId, lineId, timeToArrive }
						));
					}
					const lastbusArrive = busesArriveTexts.pop();
					fulfillmentText += busesArriveTexts.join(app.i18n.__('text.separator.item'));
					fulfillmentText += app.i18n.__('text.separator.and') + lastbusArrive + '.';
				break;
			}
		}
		app.ask(`<speak>${fulfillmentText}</speak>`);
	});
	//app.sendResponse('Hola! Bienvenido a Autobuses de Madrid. ¿Que autobús quieres coger?'); // Send simple response to user
}

function groupByKey(arr, key) {
	let result = {};
	if (arr && arr.length) {
		for (let item of arr) {
			result[item[key]] = result[item[key]] ? result[item[key]] : [];
			result[item[key]].push(item);
		}
	}
	return result;
}
module.exports = InputStopHandler;