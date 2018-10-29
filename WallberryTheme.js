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
		orientation: "portrait", // desired photo orientation - can be portrait, landscape, or square
		resizeForScreen: true // resize image for screen - otherwise image is displayed at full height/width
	},

	photoData: null,

	getStyles: function() {
		return [
			this.file("css/WallberryTheme.css")
		];
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		this.fetchPhoto();
	},

	getDom: function() {
		var wrapper = document.createElement('div');

		if (this.photoData == null) {
			return wrapper;
		}

		var image = document.createElement('img');
		var attribution = document.createElement('div');

		image.src = this.photoData.url;
		attribution.innerText = 'Photo by ' + this.photoData.authorName + ' on Unsplash';
		attribution.className = "wb-unsplash-bg-attribution";
		wrapper.appendChild(image);
		wrapper.appendChild(attribution);
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

		var req = new XMLHttpRequest();
		var mod = this;
		req.addEventListener("load", function() {
			if (this.status == 200) {
				mod.processPhoto(JSON.parse(this.responseText));
			}
		});
		req.addEventListener("error", function() {
			Log.info("Error Fetching photo: ", this.responseText);
		});
		req.open("GET", url);
		req.setRequestHeader('Accept-Version', 'v1');
		req.send();
	},

	processPhoto: function(photoData) {
		Log.info("Got PHOTO data: ", photoData);
		var p = {};
		if (this.config.resizeForScreen) {
			p.url = photoData.urls.custom;
		} else {
			p.url = photoData.urls.full;
		}

		p.authorName = photoData.user.name;

		this.photoData = p;
		this.updateDom(2000);
		setTimeout(() => {this.fetchPhoto()}, this.config.updateInterval);
	}
});
