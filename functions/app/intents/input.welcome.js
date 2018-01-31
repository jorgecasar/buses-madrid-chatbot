function inputWelcomeHandler(app){
	console.log('inputWelcomeHandler');
	let appName = app.i18n.__('app.name');
	if (app.isInSandbox()) {
		appName += ' v.' + app.version;
	}
	if (app.getLastSeen()) {
    app.ask(app.getWelcomeBack());
  } else {
		app.ask(app.i18n.__('input.welcome.greeting', { appName }));
  }
};

module.exports = inputWelcomeHandler;
