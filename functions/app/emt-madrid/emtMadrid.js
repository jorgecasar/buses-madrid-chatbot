var rp = require('request-promise-native');

let _client, _key, _lang;

class EMTMadrid {
	static get baseUrl() {
		return 'https://openbus.emtmadrid.es:9443/emt-proxy-server/last/';
	}

	static get namespace() {
		return '[namespace]';
	}

	constructor(client, key, lang = 'es') {
		_client = client;
		_key = key;
		_lang = lang;
	}

	_glueUri(method) {
		return `${this.constructor.baseUrl}${this.constructor.namespace}/${method}.php`;
	}

	_glueBody(body) {
		body.idClient = _client;
		body.passKey = _key;
		body.cultureInfo = _lang;
		return body;
	}

	_requestOptions(method, body) {
		return {
			method: 'POST',
			uri: this._glueUri(method),
			form: this._glueBody(body),
			gzip: true,
			json: true,
			strictSSL: false
		}
	}

	request(method, body) {
		var options = this._requestOptions(method, body);
		console.log(options);
		return rp(options)
			.catch(err => {
				error(err);
				throw err;
			})
			.then(response => {
				//console.log('EMT response: ', JSON.stringify(response));
				return response;
			});
	}
}

module.exports = EMTMadrid;
