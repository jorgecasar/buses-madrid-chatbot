const Bus = require('./bus');
const Geo = require('./geo');

/* 
const config = {
	idClient: 'WEB.SERV.jorge.casar@gmail.com',
	passKey: 'AD202569-56BC-40BD-BF57-1F9938192D52'
};

const geo = new Geo(config.idClient, config.passKey);
geo.arrive(4267, 174)
	.catch(console.error.bind(console))
	//.then(response => response[0])
	.then(response => console.log(response))

*/

module.exports = {
	Bus,
	Geo
};

