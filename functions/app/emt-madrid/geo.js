const EMTMadrid = require('./emtMadrid');
const { toTitleCase, formatDate } = require('./utils/formater');

class Geo extends EMTMadrid {
	static get namespace() {
		return 'geo';
	}

	arrive(stopId, lineId) {
		lineId = lineId.toString();
		return this.request('GetArriveStop', {
			idStop: stopId
		})
		.then(response => response && response.arrives ? response.arrives : [])
		.then(response => lineId ? response.filter(
			item => item.lineId === lineId
		) : response)
	}
	stops(coords, lineId, radius = 500) {
		lineId = lineId.toString();
		return this.request('GetStopsFromXY', {
			latitude: coords.latitude,
			longitude: coords.longitude,
			Radius: radius
		})
		.then(response => response && response.stop ? response.stop : [])
		.then(response => lineId ? response.filter(item =>
			(Array.isArray() ? item.line : [item.line])
				.filter(item => item.line === lineId)
				.map(item => {
					item.headerA = toTitleCase(item.headerA);
					item.headerB = toTitleCase(item.headerB);
					return item;
				})
		) : response)
		.then(response => response.map(item => {
			item.name = toTitleCase(item.name);
			if(item.postalAddress.slice(-1) === '.') {
				item.postalAddress = item.postalAddress.slice(0, -1);
			}
			item.postalAddress = item.postalAddress.replace('Nº', 'número');
			return item;
		}))
	}

}

function log(msg, response) {
	console.log(msg);
	return response;
}

module.exports = Geo;
