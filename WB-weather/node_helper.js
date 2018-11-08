const NodeHelper = require('node_helper');
var request = require('request');
var moment = require('moment');

module.exports = NodeHelper.create({
  start: function() {
    this.config = null;
	},

	fetchData: function() {
    if (this.config === null) {
      return
    }

    let wurl = "https://api.darksky.net/forecast/" +
      this.config.darkSkyApiKey + "/" +
      this.config.latitude + "," +
      this.config.longitude +
      "?units=" + this.config.units +
      "&lang=" + this.config.language;

    request({
			url: wurl,
			method: 'GET'
		}, (error, response, body) => {
      if (error) {
        this.sendSocketNotification("NETWORK_ERROR", error);
      } else {
        this.sendSocketNotification("DATA_AVAILABLE", response);
      }
		});
	},

	socketNotificationReceived: function(notification, payload) {
    switch(notification) {
      case "SET_CONFIG":
      this.config = payload;
      break;

      case "FETCH_DATA":
      this.fetchData();
      break;
    }
	}
});
