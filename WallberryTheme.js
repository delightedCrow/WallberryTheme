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
		smartDimOn: false // VERY BETA lol
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
			let img = document.createElement('img');
			img.crossOrigin = "Anonymous"; // otherwise we'll get a security error if we attempt to draw this image on the canvas later
			img.style.opacity = this.config.backgroundOpacity;
			let mod = this;
			if (this.config.smartDimOn) {
				img.onload = function(){mod.setSmartOpacity(this);};
			}
			img.src = this.photoData.url;

			wrapper.innerHTML = `
			<div class="wb-unsplash-bg-attribution">Photo by ${this.photoData.authorName} on Unsplash</div>
			`;
			wrapper.appendChild(img);

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
	},

	setSmartOpacity: function(img) {
		// this function thanks to ToniTornado's SO answer:
		// https://stackoverflow.com/questions/13762864/image-dark-light-detection-client-sided-script

		var fuzzy = 0.1;
		// create canvas
		var canvas = document.createElement("canvas");
		canvas.width = img.width;
		canvas.height = img.height;

		var ctx = canvas.getContext("2d");
		ctx.drawImage(img,0,0);

		var imageData = ctx.getImageData(0,0,canvas.width,canvas.height);
		var data = imageData.data;
		var r,g,b, max_rgb;
		var light = 0, dark = 0;

		for(var x = 0, len = data.length; x < len; x+=4) {
				r = data[x];
				g = data[x+1];
				b = data[x+2];

				max_rgb = Math.max(Math.max(r, g), b);
				if (max_rgb < 128)
						dark++;
				else
						light++;
		}

		var dl_diff = ((light - dark) / (img.width*img.height));
		if (dl_diff + fuzzy < 0){
			Log.info("Dark Image"); /* Dark. */
			img.style.opacity = 1;
		} else {
			Log.info("Light Image");  /* Not dark. */
			img.style.opacity = 0.8;
		}
	},
});
