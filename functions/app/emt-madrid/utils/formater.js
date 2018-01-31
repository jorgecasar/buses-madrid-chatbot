function capitalize(str) {
	return str.length ? str[0].toUpperCase() + str.slice(1).toLowerCase() : '';
}

function toTitleCase(str) {
	return str.toLowerCase()
		.replace(/\.([^\s\d])/g, '. $1') // space after point.
		.replace(/([^s])\-([^\s])/g, '$1 - $2') // set spaces around dash (-).
		.replace(/^(.)|\s(.)|\/(.)/g, ($1) => $1.toUpperCase())
}

var formatDate = function(date, days) {
  if (days) {
    date.setDate(date.getDate() + days);
  }

  var dd = ('0' + date.getDate()).slice(-2);
  var mm = ('0' + (date.getMonth() + 1)).slice(-2);
  var yyyy = date.getFullYear().toString();
  return dd + '/' + mm + '/' + yyyy;
};


module.exports = {
	toTitleCase,
	formatDate
};