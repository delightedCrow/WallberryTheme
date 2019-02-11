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
		backgroundOpacity: 1, // between 0 (black background) and 1 (visible opaque background)
		smartDimOn: false, // VERY BETA lol
		backgroundFadeOn: true
	},

	photoData: null,
	photoElement: null,
	photoError: null,
	fetchTimer: null,

	getStyles: function() {
		return [
			this.file("css/WallberryTheme.css"),
			"font-awesome5.css"
		];
	},

	getScripts: function() {
		return ["colorHelpers.js"]
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		this.fetchPhoto();
	},

	getDom: function() {
		var wrapper = document.createElement('div');
		// set up the markup for our image if we have one
		if (this.photoElement != null) {
			wrapper.innerHTML = `
			<div class="wb-unsplash-bg-attribution">Photo by ${this.photoData.authorName} on Unsplash</div>
			`;
			wrapper.appendChild(this.photoElement);

			if (this.config.backgroundFadeOn)
				this.setBackgroundFades();
		// markup in case of error message
		} else if (this.photoError != null) {
			const errorHTML = `<div class="wb-unsplash-bg-error">
			<div class="wb-error-reason"><i class="wb-error-icon fa fa-exclamation-triangle" aria-hidden="true"></i>Error Loading Background<i class="wb-error-icon fa fa-exclamation-triangle" aria-hidden="true"></i></div>
			<div class="wb-error-info">${this.photoError}</div>
			</div>`;
			wrapper.innerHTML = errorHTML;
		} else {
			wrapper.innerHTML = '<div class="wb-unsplash-bg-attribution">Loading background photo...</div>';
		}
		return wrapper;
	},

	setBackgroundFades: function() {
		let color = WBColor.rgb2Hsv(WBColor.hex2Rgb(this.photoData.color));
		let	light = WBColor.hsv2Rgb({h:color.h, s:20, v:20});
		let dark = WBColor.hsv2Rgb({h:color.h, s:10, v:5});

		let topBar = document.getElementsByClassName("region top bar")[0];
		topBar.style.background = `linear-gradient(rgba(${dark.r}, ${dark.g}, ${dark.b}, 0.7), rgba(${light.r}, ${light.g}, ${light.b}, 0))`;
		let bottomBar = document.getElementsByClassName("region bottom bar")[0];
		bottomBar.style.background = `linear-gradient(rgba(${light.r}, ${light.g}, ${light.b}, 0), black)`;
		let darkBackground = `rgb(${dark.r}, ${dark.g}, ${dark.b})`;
		let html = document.getElementsByTagName('html')[0];
		let body = document.getElementsByTagName('body')[0];
		body.style.backgroundColor = darkBackground;
		html.style.backgroundColor = darkBackground;
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
		p.color = photoData.color;
		this.photoData = p;

		let img = document.createElement('img');
		img.style.opacity = this.config.backgroundOpacity;
		img.onload = () => {
			if (this.config.smartDimOn) {
				img.style.opacity = WBColor.isImageLight(img) ? 0.85 : 1;
			}
			this.updateDom(2000);
			this.fetchTimer = setTimeout(() => {this.fetchPhoto()}, this.config.updateInterval);
		};

		img.crossOrigin = "Anonymous"; // otherwise we'll get a security error if we attempt to draw this image on the canvas later
		img.src = this.photoData.url;
		this.photoElement = img;
	}
});
