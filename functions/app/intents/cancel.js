
function handler(app){
	console.log('cancel');
	app.tell(app.getGoodbay());
};

module.exports = handler;
