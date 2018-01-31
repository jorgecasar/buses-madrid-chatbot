const functions = require('firebase-functions');
const Debug = require('debug');
const debug = Debug('buses-madrid:bus.location-request:debug');
const error = Debug('buses-madrid:bus.location-request:error');

// Configure logging for hosting platforms that only support console.log and console.error
debug.log = console.log.bind(console);
error.log = console.error.bind(console);

function handler(app){
	debug('bus.location-request');
	debug('APP_DATA', app.data);
	app.userStorage.input = app.data;
	app.askForPermission(
		app.i18n.__('request.permission.location'),
		app.SupportedPermissions.DEVICE_PRECISE_LOCATION
	);
};

module.exports = handler;
