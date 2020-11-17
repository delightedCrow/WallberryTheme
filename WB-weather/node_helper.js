const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

	fetchData: function(config) {
		var helper = require(`./providers/WB-${config.providerName}-helper.js`);
		helper(config.data).then(result => {
			this.sendSocketNotification("DATA_AVAILABLE", result);
		});
	},

	socketNotificationReceived: function(notification, payload) {
		console.log("NOTIFICATION!");
		switch(notification) {
			case "FETCH_DATA":
				console.log("TOLD TO FETCH!");
				console.log(payload);
				this.fetchData(payload);
			break;
		}
	}
});
