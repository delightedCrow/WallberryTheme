const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

	fetchData: function(config) {
		var helper = require(`./providers/WB-${config.providerName}-helper.js`);
		helper(config.data).then(result => {
			this.sendSocketNotification("DATA_AVAILABLE", result);
		});
	},

	socketNotificationReceived: function(notification, payload) {
		switch(notification) {
			case "FETCH_DATA":
				this.fetchData(payload);
			break;
		}
	}
});
