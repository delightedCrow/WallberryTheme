/* Magic Mirror - WallberryTheme <3
 * Module: WB-weather
 *
 * By JSC (@delightedCrow)
 * MIT Licensed.
 */

class WBDarkSky extends WBProviderWithHelper {
	constructor(config, delegate) {
		super(config, delegate);
		let unitConversions = {"imperial":"us", "metric":"si"};
		this.units = unitConversions[config.units];
		this.baseURL = `https://api.darksky.net/forecast/${config.apiKey}/${config.latitude},${config.longitude}`;
		this.url = this.getQueryStringURL(this.baseURL, {
			"units": this.units, // figure out units
			"lang": config.language
		});
	}

	get updateIntervalLimit() {
		return 10 * 60 * 1000; // 10 minutes
	}

	get daysToForecastLimit() {
		return 8;
	}

	dataForHelper() {
		return {url: this.url};
	}

	helperResponse(data) {
		if ("network_error" in data) {
			this.resolveWithTemporaryError(data.network_error.message);
			return;
		}
		if ("error" in data) {
			this.resolveWithCriticalError(data.error);
			return;
		}

		this.resolveWithSuccess(this.process(data));
	}

	process(data) {
		// process our data into a WBWeather object
		var w = new WBWeather();
		w.temp = data.currently.temperature;
		w.wicon = `wi-${data.currently.icon}`;
		w.longDescription = (data.minutely != null) ? data.minutely.summary : data.hourly.summary;

		w.forecast = data.daily.data.slice(0,this.daysToForecast).map((daily) => {
			var f = new WBForecast();
			f.date = daily.time;
			f.precipChance = daily.precipProbability * 100;
			f.precipType = ("precipType" in daily) ? daily.precipType : "rain";
			f.minTemp = daily.temperatureHigh;
			f.maxTemp = daily.temperatureLow;
			f.wicon = `wi-forecast-io-${daily.icon}`;

			return f;
		});

		return w;
	}
}

WBProviderManager.register("darksky", WBDarkSky);
