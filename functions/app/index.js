const { DialogflowApp } = require('actions-on-google');
const Debug = require('debug');
const debug = Debug('buses-madrid:app:debug');
const error = Debug('buses-madrid:app:error');
const i18n = require('i18n');
const moment = require('moment');

debug.log = console.log.bind(console);
error.log = console.error.bind(console);

class App extends DialogflowApp {

	get version() {
		const { version } = require('../package.json');
		return version;
	}

	constructor(request, response) {
		super(request, response);
		this.i18n = i18n;
		this.moment = moment;
		i18n.configure({
			locales: ['es', 'en'],
			defaultLocale: 'es',
			fallbacks: {
				'es-ES': 'es',
				'es-419': 'es',
				'en-AU': 'en',
				'en-CA': 'en',
				'en-GB': 'en',
				'en-IN': 'en',
				'en-US': 'en'
			},
			objectNotation: true,
			directory: __dirname + '/locales'
		});
		debug('UserLocale', this.getUserLocale());
		i18n.setLocale(this.getUserLocale());
		moment.locale(this.getUserLocale());
		this.StandardIntents.UNKNOWN = 'input.unknown';
		this.data.fallbackCount = this.data.fallbackCount || 0;
	}

	buildResponse_(textToSpeech, expectUserResponse, noInputs) {
		let response = super.buildResponse_(textToSpeech, expectUserResponse, noInputs);
		if(textToSpeech.event) {
			response.followupEvent = textToSpeech.event;
		}
		debug('response', response);
		return response;
	}

	handleRequest(handler) {
		if(!handler) {
			try{
				handler = require(`./intents/${this.getIntent()}`);
			} catch(err){
				console.error(err);
				handler = require(`./intents/${this.StandardIntents.UNKNOWN}`);
			}
		}
		super.handleRequest(handler);
	}

	getGoodbay() {
		return this.getRandomFromArray(this.i18n.__('goodbye'));
	}

	getWelcomeBack() {
		return this.getRandomFromArray(this.i18n.__('welcome.welcomeback'));
	}

	getMoreHelpText() {
		return ' ' + this.getRandomFromArray(this.i18n.__('text.more-help'));
	}

	getRandomFromArray(arr) {
		return arr[Math.floor(Math.random() * arr.length)];
	}

}

module.exports = App;
