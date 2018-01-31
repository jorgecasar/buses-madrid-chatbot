
const App = require('./app');

module.exports = (request, response) => {
  console.log('Dialogflow Request body', JSON.stringify(request.body));

	const app = new App({request, response});
  app.handleRequest();
};
