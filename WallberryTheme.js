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
		brightImageOpacity: 0.85, // between 0 (black background) and 1 (visible opaque background), only used when autoDimOn is true
		autoDimOn: true, // automatically darken bright images
		addBackgroundFade: ["top", "bottom"] // adds fades for the top and bottom bar regions (leave an empty list to remove fades)
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
			this.setBackgroundTint();
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

	setBackgroundTint: function() {
		// Unsplash sends us a color swatch for the image
		let color = WBColor.rgb2Hsv(WBColor.hex2Rgb(this.photoData.color));
		// using the hue from this color we can generate a new light shade for our gradient
		let	light = WBColor.hsv2Rgb({h:color.h, s:20, v:30});
		// and a new dark shade for a gradient
		let dark = WBColor.hsv2Rgb({h:color.h, s:40, v:7});
		// TODO: the s/v values above are hardcoded because they seemed to work well in many cases, but it might be nice to have these be configurable

		if (this.config.addBackgroundFade.includes("top")) {
			let topBar = document.getElementsByClassName("region top bar")[0];
			topBar.style.background = `linear-gradient(rgba(${dark.r}, ${dark.g}, ${dark.b}, 0.7), rgba(${light.r}, ${light.g}, ${light.b}, 0))`;
		}
		if (this.config.addBackgroundFade.includes("bottom")) {
			let bottomBar = document.getElementsByClassName("region bottom bar")[0];
			bottomBar.style.background = `linear-gradient(rgba(${light.r}, ${light.g}, ${light.b}, 0), black)`;
		}

		// setting the html/body background colors to the dark shade gives a much richer color to the image when it becomes transparent. We set the image to be transparent when we want to dim it (because the black background then comes through), but having a pure black background can cause the image to look greyish and washed out.
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
			} else {
				mod.processError(`Unsplash Error: ${this.status}, ${this.statusText}`);
				Log.error("Unsplash Error: ", this.responseText);
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
			if (this.config.autoDimOn) {
				img.style.opacity = WBColor.isImageLight(img) ?
					this.config.brightImageOpacity : this.config.backgroundOpacity;
			}
			this.updateDom(2000);
			this.fetchTimer = setTimeout(() => {this.fetchPhoto()}, this.config.updateInterval);
		};

		img.crossOrigin = "Anonymous"; // otherwise we'll get a security error if we attempt to draw this image on the canvas later (when we check if it's dark or light)
		img.src = this.photoData.url;
		this.photoElement = img;
	}
});
