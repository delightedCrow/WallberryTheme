/* Magic Mirror - WallberryTheme <3
 * Module: WB-weather
 *
 * By JSC (@delightedCrow)
 * MIT Licensed.
 */
Module.register("WB-weather", {
	// Module config defaults.
	defaults: {
		darkSkyApiKey: null, // REQUIRED
		latitude: "", // REQUIRED
		longitude: "", // REQUIRED

		units: "auto", // what measurement units to use (SI, US, auto)
		roundTemp: true, // round temperature to nearest integer
		language: config.language, // what language to localize for
		daysToForecast: 4, // how many days to include in upcoming forecast

		updateInterval: 10 * 60 * 1000, // 10 minutes
		initialLoadDelay: 1000,
		retryDelay: 2500
	},

	fetchTimer: null,

	wdata: {
		maxForecastPossible: 8, // DarkSky only allows for up to 8 days
		fetchError: null,
		fetchResponse: null,
	},

	precipIcons: { // icons for displaying type of precipitation
		"default": "wi-raindrop",
		"rain": "wi-raindrop",
		"snow": "wi-snowflake-cold"
	},

	translationKey: {
		loading: "WLOADING",
		invalidKey: "API_KEY_MISSING",
		today: "TODAY",
		connectionError: "CONNECTION_ERROR",
		error: "ERROR"
	},

	getTranslations: function() {
		return {
			en: "translations/en.json"
		};
	},

	getScripts: function() {
		return ["moment.js"];
	},

	getStyles: function() {
		return ["weather-icons.css", "WB-weather.css"];
	},

	getTemplate: function() {
		return "WB-weather.njk";
	},

	getTemplateData: function() {
		return {
			config: this.config,
			weather: this.getWeatherDataForTemplate(),
			status: this.getStatusDataForTemplate()
		};
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		if (this.config.darkSkyApiKey) {
			this.sendSocketNotification("SET_CONFIG", this.config);
			this.scheduleUpdate(this.config.initialLoadDelay);
		}
	},

	suspend: function() {
		Log.info("Suspending WB-weather...");
		clearTimeout(this.fetchTimer);
	},

	resume: function() {
		this.start();
	},

	scheduleUpdate: function(delay=null) {
		var nextFetch = this.config.updateInterval;
		if (delay !== null && delay >= 0) {
			nextFetch = delay;
		}
		Log.info(`Scheduling weather update for ${nextFetch} milliseconds`);
		this.fetchTimer = setTimeout(() => {
			this.sendSocketNotification("FETCH_DATA");
		}, nextFetch);
	},

	socketNotificationReceived: function(notification, payload) {
		Log.info(`Socket notification: ${notification}, `, payload);
		switch(notification) {
		case "NETWORK_ERROR":
			// this is likely due to connection issue - we should retry in a bit
			Log.error("Error reaching DarkSky: ", payload);
			this.wdata.fetchError = payload;
			this.scheduleUpdate();
			break;

		case "DATA_AVAILABLE":
			// code 200 means all went well - we have weather data
			if (payload.statusCode == 200) {
				this.scheduleUpdate();
			} else {
				// if we get anything other than a 200 from DarkSky it's probably a config error or something else the user will have to restart MagicMirror to address - we shouldn't schedule anymore updates
				Log.error("DarkSky Error: ", payload);
			}
			this.wdata.fetchResponse = payload;
			break;

			// don't update on any other message
			default:
			  return;
		}

		this.updateDom();
	},

	// this handles getting the translated error/loading messages for the template
	getStatusDataForTemplate: function() {
		var status = {};
		// if fetchResponse is null then we haven't gotten data yet - we're still loading (unless we have an empty API key - then we'll never load anything!)
		if (this.config.darkSkyApiKey && !this.wdata.fetchResponse) {
			status.loadingMessage = this.translate(this.translationKey.loading);
			return status;
		}

		// DarkSky status code of 403 or a missing API key results in INVALID KEY error
		if (this.config.darkSkyApiKey == null || this.wdata.fetchResponse.statusCode == 403) {
			status.error = this.translate(this.translationKey.invalidKey);
			return status;
		}

		// DarkSky sent us an error of some kind, probably user supplied an incorrect config parameter
		if (this.wdata.fetchResponse.statusCode != 200) {
			let errorObj = JSON.parse(this.wdata.fetchResponse.body);
			status.error = this.translate(this.translationKey.error) + errorObj.error;
			return status;
		}

		// Looks like we got a network error
		if (this.wdata.fetchError != null) {
			status.error = this.translate(this.translationKey.connectionError);
			return status;
		}
	},

	// handles processing all the weather data for the template
	getWeatherDataForTemplate: function() {
		// if we don't have weather data we can just return now
		if (this.wdata.fetchResponse == null || this.wdata.fetchResponse.statusCode != 200) {
			return null;
		}

		let darksky = JSON.parse(this.wdata.fetchResponse.body);
		var weather = {};
		weather.forecast = [];

		weather.currentTemp = Math.round(darksky.currently.temperature);
		if (darksky.minutely != null) {
			weather.currentDescription = darksky.minutely.summary;
		} else {
			weather.currentDescription = darksky.hourly.summary;
		}

		weather.currentIcon = darksky.currently.icon;

		for (var i=0; i<this.config.daysToForecast; i++) {
			var day = {};
			let forecast = darksky.daily.data[i];
			day.highTemp = Math.round(forecast.temperatureHigh);
			day.lowTemp = Math.round(forecast.temperatureLow);
			day.precipProbability = Math.round(forecast.precipProbability * 100); // x100 to convert from decimal to percentage
			day.precipType = forecast.hasOwnProperty("precipType") ? this.precipIcons[forecast.precipType] : this.precipIcons["default"];
			day.icon = forecast.icon;

			var date = new Date(forecast.time*1000); // not sure about the x1000 here
			day.dayLabel = moment.weekdaysShort(date.getDay());

			// changing the day label to "today" instead of day of the week
			if (i === 0) {
				day.dayLabel = this.translate(this.translationKey.today);
			}
			weather.forecast.push(day);
		}

		return weather;
	}
});
