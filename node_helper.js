const NodeHelper = require("node_helper");
const {BrowserWindow} = require("electron");

module.exports = NodeHelper.create({

	socketNotificationReceived: function(notification, payload) {
		switch(notification) {
		case "CLEAR_CACHE":
			try {
				const win = BrowserWindow.getAllWindows()[0];
				const ses = win.webContents.session;

				ses.clearCache().then(() => {
					console.log("Electron's cache successfully cleared.");
					this.sendSocketNotification("ELECTRON_CACHE_CLEARED", {});
				});

			} catch (e) {
				// We'll get a TypeError if MM is being run in server only mode because Electron won't be running the app - if that's the case we can just say the cache has been cleared and call it a day
				if (e.name == "TypeError") {
					this.sendSocketNotification("ELECTRON_CACHE_CLEARED", {});
				} else {
					console.log("WallberryTheme ERROR: ", e);
				}
			}

			break;
		}
	}
});
