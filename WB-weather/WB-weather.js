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

    units: config.units, // what measurement units to use (SI, US, etc)
    roundTemp: true, // round temperature to nearest integer
    language: config.language, // what language to localize for
		daysToForecast: 4, // how many days to include in upcoming forecast

    updateInterval: 10 * 60 * 1000, // 10 minutes
    initialLoadDelay: 1000,
    retryDelay: 2500
	},

	wdata: {
		maxForecastPossible: 8, // DarkSky only allows for up to 8 days
		weather: null,
		fetchError: null,
		fetchResponse: null,
		loading: true,
		apiKeyError: false
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
		serverError: "SERVER_ERROR"
	},

	getTranslations: function() {
		return {
			en: "translations/en.json"
		}
	},

	getScripts: function() {
		return ["moment.js"]
	},

	getStyles: function() {
		return ["weather-icons.css", "WB-weather.css"]
	},

	getTemplate: function() {
		return "WB-weather.njk"
	},

	start: function() {
		Log.info("Starting module: " + this.name);
		if (this.config.darkSkyApiKey == null) {
			this.wdata.apiKeyError = true;
		} else {
			this.sendSocketNotification("SET_CONFIG", this.config);
			this.scheduleUpdate(this.config.initialLoadDelay);
		}
	},

	scheduleUpdate: function(delay=null) {
		var nextFetch = this.config.updateInterval;
		if (delay !== null && delay >= 0) {
			nextFetch = delay;
		}
		setTimeout(() => {this.sendSocketNotification("FETCH_DATA")}, nextFetch);
	},

	socketNotificationReceived: function(notification, payload) {
		switch(notification) {
			case "DATA_AVAILABLE":
				if (payload.error) {
					Log.error("Error reaching DarkSky: ", payload.error);
					this.wdata.fetchError = payload.error;
					this.scheduleUpdate();
				} else if (payload.response.statusCode == 200) {
					this.wdata.weather = JSON.parse(payload.data);
					this.scheduleUpdate();
				} else if (payload.response.statusCode == 403) {
					this.wdata.apiKeyError = true;
				} else {
					this.wdata.fetchResponse = payload.response;
				}

				Log.log(payload.response);
				Log.log(payload.error);
				this.wdata.loading = false;
				this.updateDom();

				Log.log("Weather GOT DATA: ", this.wdata.weather);
				break;
		}
	},

	getTemplateData: function() {

		return {
      config: this.config,
      weather: this.getWeatherDataForTemplate(),
			status: this.getStatusDataForTemplate()
    };
	},

	getStatusDataForTemplate: function() {
		var status = {}
		status.loadingMessage = null;
		if (this.wdata.loading) {
			status.loadingMessage = this.translate(this.translationKey.loading);
		}

		if (this.wdata.apiKeyError) {
			status.error = this.translate(this.translationKey.invalidKey);
		}

		if (this.wdata.response && this.wdata.response.statusCode != 200) {
			status.error = this.translate(this.translationKey.error) +
			this.wdata.response.body;
		}

		if (this.wdata.fetchError != null) {
			status.error = this.translate(this.translationKey.serverError);
		}

		return status;
	},

	getWeatherDataForTemplate: function() {
		// if we don't have weather data we can just return now
		if (this.wdata.weather == null) {
			return null;
		}

		var weather = {};
    weather.forecast = [];
    Log.log(this.wdata.weather);

    weather.currentTemp = Math.round(this.wdata.weather.currently.temperature);
		if (this.wdata.weather.minutely != null) {
			weather.currentDescription = this.wdata.weather.minutely.summary;
		} else {
			weather.currentDescription = this.wdata.weather.hourly.summary
		}

		weather.currentIcon = this.wdata.weather.currently.icon;

    for (var i=0; i<this.config.daysToForecast; i++) {
      var day = {};
      let data = this.wdata.weather.daily.data[i];
      day.highTemp = Math.round(data.temperatureHigh);
      day.lowTemp = Math.round(data.temperatureLow);
      day.precipProbability = Math.round(data.precipProbability * 100); // x100 to convert from decimal to percentage
      day.precipType = data.hasOwnProperty("precipType") ? this.precipIcons[data.precipType] : this.precipIcons["default"];
      day.icon = data.icon;

      var date = new Date(data.time*1000); // not sure about the x1000 here
      day.dayLabel = moment.weekdaysShort(date.getDay());

      // LOL
      if (i === 0) {
        day.dayLabel = this.translate(this.translationKey.today);
      }
			weather.forecast.push(day);
    }

		return weather;
	}
	});
