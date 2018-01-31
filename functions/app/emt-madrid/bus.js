const EMTMadrid = require('./emtMadrid');
const { toTitleCase, formatDate } = require('./utils/formater');

class Bus extends EMTMadrid {
	static get namespace() {
		return 'bus';
	}

	nodes(nodes, extended = true) {
		nodes = Array.isArray(nodes) ? nodes.join('|') : nodes;
		return this.request('GetNodesLines', { Nodes: nodes })
		.then(response => response.resultValues)
		.then(response => Array.isArray(response) ? response : [response])
		.then(response => response.map(item => {
			item.name = toTitleCase(item.name)
			item.lines = item.lines
				.filter(item => item)
				.map(item => item.split('/')[0]);
			return item;
		}))
		.then(response => {
			if (extended) {
				return Promise.all(
					response.map(
						item => this.request('GetListLines', {
							SelectDate: formatDate(new Date),
							Lines: item.lines.join('|')
						})
						.then(response => response.resultValues)
						.then(lines => {
							item.lines = lines
							return item;
						})
					)
				)
			} else {
				return response;
			}
		})
	}
}

function log(msg, response) {
	console.log(msg);
	return response;
}

module.exports = Bus;