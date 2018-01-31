
function handler(app){
	console.log('no-input');
	const noInput = app.i18n.__('fallback.no-input');
	const repromptCount = app.getRepromptCount();
	if (repromptCount < 2) {
		app.ask(noInput[repromptCount-1]);
	} else if (app.isFinalReprompt()) {
		app.tell(noInput[noInput.length-1]);
	}
};

module.exports = handler;
