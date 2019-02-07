/* Magic Mirror - WallberryTheme <3
 * Module: WallberryTheme
 *
 * By JSC (@delightedCrow)
 * MIT Licensed.
 */
Module.register("WallberryTheme", {
	defaults: {
		unsplashAccessKey: "", // REQUIRED

		collections: "", //comma-separated list of Unsplash collection ids

		updateInterval: 300 * 1000, // 5 min
		orientation: "portrait", // desired photo orientation - can be portrait, landscape, or squarish
		resizeForScreen: true, // resize image for screen - otherwise image is displayed at full height/width
		backgroundOpacity: 1 // between 0 (black background) and 1 (visible opaque background)
	},

	photoData: null,
	photoError: null,
	fetchTimer: null,

	getStyles: function() {
		return [
			this.file("css/WallberryTheme.css"),
			"font-awesome5.css"
		];
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		this.fetchPhoto();
	},

	getDom: function() {
		var wrapper = document.createElement('div');

		// set up the markup for our image if we have one
		if (this.photoData != null) {
			const photoHTML = `
			<img style="opacity: ${this.config.backgroundOpacity};" src="${this.photoData.url}">
			<div class="wb-unsplash-bg-attribution">Photo by ${this.photoData.authorName} on Unsplash</div>
			`;
			wrapper.innerHTML = photoHTML;

		// markup in case of error message
		} else if (this.photoError != null) {
			const errorHTML = `<div class="wb-unsplash-bg-error">
			<div class="wb-error-reason"><i class="wb-error-icon fa fa-exclamation-triangle" aria-hidden="true"></i>Error Loading Background<i class="wb-error-icon fa fa-exclamation-triangle" aria-hidden="true"></i></div>
			<div class="wb-error-info">${this.photoError}</div>
			</div>`;
			wrapper.innerHTML = errorHTML;
		}
		return wrapper;
	},

	fetchPhoto: function() {
		var url = "https://api.unsplash.com/photos/random?" +
			"client_id=" + this.config.unsplashAccessKey +
			"&collections=" + this.config.collections +
			"&orientation=" + this.config.orientation;

		if (this.config.resizeForScreen) {
			url = url +
				"&w=" + window.innerWidth +
				"&h=" + window.innerHeight;
		}

		this.photoError = null;
		var req = new XMLHttpRequest();
		var mod = this;

		req.addEventListener("load", function() {
			const unsplashData = JSON.parse(this.responseText);
			if (this.status == 200) {
				mod.processPhoto(unsplashData);
			} else if ("errors" in unsplashData) {
				mod.processError(`The Unsplash API returned the error "${unsplashData["errors"].join(", ")}"`);
			}
		});

		req.addEventListener("error", function() {
			// most likely an internet connection issue
			mod.processError("Could not connect to the Unsplash server.");
		});

		req.open("GET", url);
		req.setRequestHeader('Accept-Version', 'v1');
		req.send();
	},

	processError: function(errorText) {
		// TODO: might want to add support for translating error messages
		this.photoError = errorText;
		this.updateDom();
		this.fetchTimer = setTimeout(() => {this.fetchPhoto()}, this.config.updateInterval);
	},

	processPhoto: function(photoData) {
		Log.info("Got Unsplash photo data: ", photoData);
		var p = {};
		if (this.config.resizeForScreen) {
			p.url = photoData.urls.custom;
		} else {
			p.url = photoData.urls.full;
		}

		p.authorName = photoData.user.name;
		this.photoData = p;
		this.updateDom(2000);
		this.fetchTimer = setTimeout(() => {this.fetchPhoto()}, this.config.updateInterval);
	}
});
