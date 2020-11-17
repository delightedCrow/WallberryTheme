/* Magic Mirror - WallberryTheme <3
 * Module: WB-weather
 *
 * By JSC (@delightedCrow)
 * MIT Licensed.
 */
Module.register("WB-weather", {
	// Module config defaults.
	defaults: {
		providerName: "openweathermap",
		template: "classic-wallberry",

		apiKey: null, // REQUIRED
		latitude: "", // REQUIRED
		longitude: "", // REQUIRED

		units: config.units, // "standard", "metric", "imperial"
		language: config.language, // what language to localize for
		daysToForecast: 4, // how many days to include in upcoming forecast (including today)

		updateInterval: null,
		initialLoadDelay: 1000
	},

	fetchTimer: null,
	provider: null,

	getTranslations: function() {
		return {
			en: "translations/en.json"
		};
	},

	getScripts: function() {
		let provider = this.hasPre3Config() ? "darksky" : this.config.providerName;
		return [
			"moment.js",
			"WB-dataObjects.js",
			"WB-provider.js",
			this.file("providers/WB-" + provider.toLowerCase() + ".js")
		];
	},

	getStyles: function() {
		return [
			"weather-icons.css",
			this.file("css/" + this.config.template.toLowerCase() + ".css")
		];
	},

	getTemplate: function() {
		return `templates/${this.config.template.toLowerCase()}.njk`;
	},

	getTemplateData: function() {
		return {
			weather: this.provider.weather,
			error: this.provider.error
		};
	},

	start: function() {
		Log.info(`Starting module: ${this.name}`);
		this.addNunjuckFilters();

		if (this.hasPre3Config()) {
			// make the update a little smoother for the people who updated from a pre-3.0 version of WB-weather and are still using darksky
			this.config.providerName = "darksky";
			this.config.apiKey = this.config.darkSkyApiKey;
		}
		// TODO: add a check to make sure the provider in this.config is actually a legit provider
		this.provider = WBProviderManager.initialize(this.config, this);
		this.scheduleUpdate(this.config.initialLoadDelay);
	},

	suspend: function() {
		Log.info(`Suspending module: ${this.name}`);
		clearTimeout(this.fetchTimer);
	},

	resume: function() {
		Log.info(`Resuming module: ${this.name}`);
		clearTimeout(this.fetchTimer);
		this.scheduleUpdate(this.config.initialLoadDelay);
	},

	// gets called by the weather provider when it has an update available
	updateAvailable: function() {
		// Only schedule another fetch if we succeeded in getting the weather or if the error we encountered is temporary
		if (this.provider.error === null) {
			// No errors, we successfully got the weather!
			this.scheduleUpdate(this.provider.updateInterval);
		} else if (this.provider.error.isTemporary) {
			// We got an error, but we might recover from it if we retry the request again later
			this.scheduleUpdate(this.provider.error.retryDelay);
		}

		// we should update the dom with the new update
		this.weather = this.provider.weather;
		this.error = this.provider.error;
		this.updateDom();
	},

	scheduleUpdate: function(delay=null) {
		var nextFetch = this.provider.updateInterval;
		if (delay !== null && delay >= 0) {
			nextFetch = delay;
		}

		this.fetchTimer = setTimeout(() => {
			if (this.provider.usesNodeHelper) {
				this.sendSocketNotification("FETCH_DATA", {providerName: this.provider.name, data: this.provider.dataForHelper()});
			} else {
				this.provider.fetchWeather();
			}
		}, nextFetch);
	},

	socketNotificationReceived: function(notification, payload) {
		switch(notification) {
			case "DATA_AVAILABLE":
				// TODO: check if this helper response is for this instance of WB-weather
				this.provider.helperResponse(payload);
				break;
		}
	},

	hasPre3Config: function() {
		if (this.config.apiKey == null && this.config.darkSkyApiKey !==null) {
			return true;
		}
		return false;
	},

	nunjucksEnvironment: function() {
		if (this._nunjucksEnvironment !== null) {
			return this._nunjucksEnvironment;
		}

		this._nunjucksEnvironment = new nunjucks.Environment(new nunjucks.WebLoader(this.file(""), {async: true, useCache: true}), {
			trimBlocks: true,
			lstripBlocks: true
		});

		return this._nunjucksEnvironment;
	},

	addNunjuckFilters: function() {
		this.nunjucksEnvironment().addFilter("dayLabel", function(timestamp) {
			var date = new Date(timestamp * 1000);
			return moment.weekdaysShort(date.getDay());
		});

		this.nunjucksEnvironment().addFilter("precipIcons", function(precipType) {
			return this.precipitationTypes[precipType];
		}.bind(this));

		this.nunjucksEnvironment().addFilter("translate", function(str, variables) {
			return this.translate(str, variables);
		}.bind(this));
	},

	precipitationTypes: {
		"snow": "wi-snowflake-cold",
		"rain": "wi-raindrop"
	},
});
