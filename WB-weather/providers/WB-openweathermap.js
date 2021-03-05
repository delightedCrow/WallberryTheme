/* Magic Mirror - WallberryTheme <3
 * Module: WB-weather
 *
 * By JSC (@delightedCrow)
 * MIT Licensed.
 */
class WBOpenWeatherMap extends WBProvider {
	constructor(config, delegate) {
		super(config, delegate);
		this.baseURL = "https://api.openweathermap.org/data/2.5/onecall";
		this.url = this.getQueryStringURL(this.baseURL, {
			"lat": config.latitude,
			"lon": config.longitude,
			"appid": config.apiKey,
			"units": config.units,
			"lang": config.language
		});
	}

	get updateIntervalLimit() {
		return 10 * 60 * 1000; // 10 minutes
	}

	get daysToForecastLimit() {
		return 8;
	}

	fetchWeather() {
		var responseOk = null;
		fetch(this.url).then(response => {
			responseOk = response.ok;
			return response.json();
		}).then(jsonData => {
			if (responseOk) {
				// success, send our weather object!
				this.resolveWithSuccess(this.process(jsonData));
			} else {
				// most of the server errors from openweathermap are issues with bad data being set -- need the user to correct their config
				this.resolveWithCriticalError(jsonData.message);
			}
		}).catch(error => {
			// most likely a network error - should resolve in a bit
			this.resolveWithTemporaryError(error.message);
		});
	}

	process(data) {
		// process our data into a WBWeather object
		var w = new WBWeather();
		w.temp = data.current.temp;
		w.wicon = `wi-owm-${data.current.weather[0].id}`;
		// TODO: be nice to make this more like Dark Sky's long description.
		w.longDescription = data.current.weather[0].description;

		w.forecast = data.daily.slice(0,this.daysToForecast).map((daily) => {
			var f = new WBForecast();
			f.date = daily.dt;
			f.precipChance = daily.pop * 100;
			f.precipType = ("snow" in daily) ? "snow" : "rain";
			f.minTemp = daily.temp.min;
			f.maxTemp = daily.temp.max;
			f.wicon = `wi-owm-${daily.weather[0].id}`;

			return f;
		});

		return w;
	}
}

WBProviderManager.register("openweathermap", WBOpenWeatherMap);
