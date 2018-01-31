const Bus = require('./bus');
const Geo = require('./geo');

const config = {
	idClient: 'WEB.SERV.jorge.casar@gmail.com',
	passKey: 'AD202569-56BC-40BD-BF57-1F9938192D52'
};



const geo = new Geo(config.idClient, config.passKey);

/*
geo.arrive(4267, 174)
	.catch(console.error.bind(console))
	//.then(response => response[0])
	.then(response => console.log(response))
*/

let lineId = 9;
geo.stops( {
	"latitude": 40.430153,
	"longitude": -3.685678899999971
}, lineId)
.then(stops => {
	let i = 0;
	let stopTo = {
		A: null,
		B: null
	}
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
	return stopTo;
})
.then(response => console.log(response))