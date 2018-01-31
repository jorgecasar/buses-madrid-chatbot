
function handler(app){
	console.log('unknown');
	app.data.fallbackCount++;
	const unknown = app.i18n.__('fallback.general');
	if (app.data.fallbackCount < 3) {
		app.ask(unknown[app.data.fallbackCount-1]);
	} else {
		app.tell(unknown[unknown.length-1]);
	}
};

module.exports = handler;
