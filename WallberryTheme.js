/* Magic Mirror - WallberryTheme <3
 * Module: WallberryTheme
 *
 * By JSC (@delightedCrow)
 * MIT Licensed.
 */

Module.register("WallberryTheme", {
	defaults: {
		unsplashAccessKey: "", // REQUIRED

		collections: "", // comma-separated list of Unsplash collection ids
		queries: [], // list of search queries to search for

		updateInterval: 300 * 1000, // 5 min
		orientation: "portrait", // desired photo orientation - can be portrait, landscape, or squarish
		resizeForScreen: true, // resize image for screen - otherwise image is displayed at full height/width
		backgroundOpacity: 1, // between 0 (black background) and 1 (visible opaque background)
		brightImageOpacity: 0.85, // between 0 (black background) and 1 (visible opaque background), only used when autoDimOn is true
		autoDimOn: true, // automatically darken bright images
		addBackgroundFade: ["top", "bottom"], // adds fades for the top and bottom bar regions (leave an empty list to remove fades)
		clearCacheOnStart: true, // clear Electron's cache on MM start
		imageWidth: "auto", // "auto" set width to screen, or specify a hardcoded width in pixels
		imageHeight: "auto", // "auto" set height to screen, or specify a hardcoded height in pixels
		imageOptions: "fit=crop" // see https://unsplash.com/documentation#dynamically-resizable-images
	},

	photoData: null,
	photoElement: null,
	photoError: null,
	fetchTimer: null,
	img: null,

	getStyles: function() {
		return [
			this.file("css/WallberryTheme.css"),
			"font-awesome.css"
		];
	},

	getScripts: function() {
		return ["colorHelpers.js"];
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		if (this.config.clearCacheOnStart) {
			this.sendSocketNotification("CLEAR_CACHE");
		} else {
			this.fetchPhoto();
		}
	},

	getTemplate: function() {
		return "WallberryTheme.njk";
	},

	getTemplateData: function() {
		return {
			config: this.config,
			photoElement: this.photoElement,
			photoData: this.photoData,
			photoError: this.photoError,
			setBackgroundTint: this.setBackgroundTint,
			getHeight: this.getFadeHeight
		};
	},

	socketNotificationReceived: function(notification, payload) {
		switch(notification) {
		case "ELECTRON_CACHE_CLEARED":
			this.fetchPhoto();
			break;
		}

	},

	fetchPhoto: function() {
		var url = "https://api.unsplash.com/photos/random?" +
			"client_id=" + this.config.unsplashAccessKey +
			"&collections=" + this.config.collections +
			"&orientation=" + this.config.orientation;

		if (this.config.queries.length > 0) {
			let query = this.config.queries[Math.floor(Math.random() * this.config.queries.length)];

			url = url +
				"&query=" + encodeURIComponent(query);
		}

		this.photoError = null;
		var req = new XMLHttpRequest();
		var mod = this;

		req.addEventListener("load", function() {
			const unsplashData = JSON.parse(this.responseText);
			if (this.status === 200) {
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
		req.setRequestHeader("Accept-Version", "v1");
		req.send();
	},

	processError: function(errorText) {
		// TODO: might want to add support for translating error messages
		this.photoError = errorText;
		this.updateDom();
		this.fetchTimer = setTimeout(() => {
			this.fetchPhoto();
		}, this.config.updateInterval);
	},

	processPhoto: function(photoData) {
		var p = {};
		let width = this.config.imageWidth == "auto" ? window.innerWidth : this.config.imageWidth;
		let height = this.config.imageHeight == "auto" ? window.innerHeight : this.config.imageHeight;

		p.url = photoData.urls.raw +
			"&w=" + width +
			"&h=" + height +
			"&" + this.config.imageOptions;

		// Unsplash sends us a color swatch for the image
		p.color = WBColor.rgb2Hsv(WBColor.hex2Rgb(photoData.color));
		// using the hue from this color we can generate a new light shade for our gradients for our fades
		p.light = WBColor.hsv2Rgb({h:p.color.h, s:20, v:30});
		p.dark = WBColor.hsv2Rgb({h:p.color.h, s:40, v:7});
		// TODO: the s/v values above are hardcoded because they seemed to work well in many cases, but it might be nice to have these be configurable
		p.authorName = photoData.user.name;
		this.photoData = p;

		if (this.img === null)
			this.img = document.createElement("img");

		this.img.style.opacity = this.config.backgroundOpacity;
		this.img.onload = () => {
			if (this.config.autoDimOn) {
				this.photoData.isLight = WBColor.isImageLight(this.img);
			}
			this.updateDom(2000);
			this.fetchTimer = setTimeout(() => {
				this.fetchPhoto();
			}, this.config.updateInterval);
		};

		this.img.crossOrigin = "Anonymous"; // otherwise we'll get a security error if we attempt to draw this image on the canvas later (when we check if it's dark or light)
		this.img.src = this.photoData.url;
		this.photoElement = this.img;
	},

	suspend: function() {
		Log.info("Suspending WallberryTheme...");
		this.setBackgroundTint({r:0, g:0, b:0}); // set background back to black
		clearTimeout(this.fetchTimer);
	},

	resume: function() {
		Log.info("Waking WallberryTheme...");
		clearTimeout(this.fetchTimer);
		this.fetchPhoto();
	},

	nunjucksEnvironment: function() {
		if (this._nunjucksEnvironment !== null) {
			return this._nunjucksEnvironment;
		}

		var self = this;

		this._nunjucksEnvironment = new nunjucks.Environment(new nunjucks.WebLoader(this.file(""), {async: true, useCache: true}), {
			trimBlocks: true,
			lstripBlocks: true
		});
		this._nunjucksEnvironment.addFilter("translate", function(str) {
			return self.translate(str);
		});

		return this._nunjucksEnvironment;
	},

	/*
			NUNJUCKS TEMPLATE HELPERS
			The following functions are passed to and used by the nunjucks template
			TODO: These should probably be added as nunjucks filters to our nunjucks environment above
	*/
	getFadeHeight: function(regionClassName) {
		// we auto-adjust the height of the background fades to be at least the height of the top bar region and bottom bar regions, in case they're bigger than the 250px min height we set in the css
		let region = document.getElementsByClassName(regionClassName)[0];
		return region.clientHeight + 70; // +70 for margin+padding
	},

	setBackgroundTint: function(tint) {
		// setting the html/body background colors to the dark shade gives a much richer color to the image when it becomes transparent.
		// We set the image to be transparent when we want to dim it (because the black background then comes through), but having a pure black background can cause the image to look greyish and washed out.
		let darkBackground = `rgb(${tint.r}, ${tint.g}, ${tint.b})`;
		let html = document.getElementsByTagName("html")[0];
		let body = document.getElementsByTagName("body")[0];
		body.style.backgroundColor = darkBackground;
		html.style.backgroundColor = darkBackground;
	},
});
