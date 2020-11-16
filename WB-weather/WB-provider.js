/* Magic Mirror - WallberryTheme <3
 * Module: WB-weather
 *
 * By JSC (@delightedCrow)
 * MIT Licensed.
 */
var WBProviderManager = {
	providers: {},
	register: function(providerName, providerClass) {
		this.providers[providerName] = providerClass;
	},

	initialize: function(providerName, config, delegate) {
		return new this.providers[providerName](providerName, config, delegate);
	}
};

// TODO: SO MUCH DOCUMENTATION
class WBProvider {
	constructor(name, config, delegate) {
		this.config = config;
		this.name = name;
		this.delegate = delegate;
		this.daysToForecast = this.checkForecastLimit(config.daysToForecast, this.daysToForecastLimit);
		this.updateInterval = this.checkUpdateLimit(config.updateInterval, this.updateIntervalLimit);

		this.weatherObject = null;
		this.forecastObjectArray = null;
		this.error = null;
	}

	// this may be a bad idea
	// TODO: do check to see if the template we have is a template we support
	supportedTemplates() {
		return ["wallberry-classic"];
	}

	// in milliseconds, the limit on how often we should check for
	// weather updates
	get updateIntervalLimit() {
		throw new Error(`Weather Provider ${this.name} does not subclass the updateIntervalLimit() getter method.`);
	}

	// how many days it's possible to get forecast for
	get daysToForecastLimit() {
		throw new Error(`Weather Provider ${this.name} does not subclass the daysToForecastLimit() getter method.`);
	}

	fetchWeather(callback) {
		throw new Error(`Weather Provider ${this.name} does not subclass the fetchWeather() method.`);
	}

	get errorRetryDelay() {
		return this.updateIntervalLimit;
	}

	get weather() {
		return this.weatherObject;
	}

	set weather(weather) {
		this.weatherObject = weather;
	}

	// call this when you've successfully finished your fetch!
	resolveWithSuccess(weatherObject) {
		Log.info(`WB-weather: successfully got weather using ${this.name}`);
		this.weather = weatherObject;
		this.error = null;
		this.delegate.updateAvailable();
	}

	// call this if you encounter a critical error that needs user intervention and the module should halt all future update requests. Errors like this are: server responds with authentication error, or the user's configuration options have resulted in a bad request
	resolveWithCriticalError(errorMessage) {
		this.error = new WBError(false, errorMessage);
		Log.error(`WB-weather: CRITICAL error fetching weather with ${this.name}: ${errorMessage}.`);
		this.delegate.updateAvailable();
	}

// call this if you encounter a temporary error and the module should try a server request again after a delay (such as, network is down, or the server is down but should come back).
	resolveWithTemporaryError(errorMessage, retryDelay) {
		let delay = retryDelay ? retryDelay : this.errorRetryDelay;
		Log.warn(`WB-weather: error fetching weather with ${this.name}: ${errorMessage}. Retrying in ${delay/1000} seconds.`);
		this.error = new WBError(true, errorMessage, delay);
		this.delegate.updateAvailable();
	}

	checkForecastLimit(userValue, limitValue) {
		if (userValue == null) {
			return limitValue;
		}

		if (userValue > limitValue) {
			Log.warn(`WARNING: daysToForecast set to ${userValue} days in the user config. This is higher than the allowable limit set by the ${this.name} API. WB-weather will use the API limit of ${limitValue} days instead.`);
			return limitValue;
		}
		return userValue;
	}

	checkUpdateLimit(userValue, limitValue) {
		if (userValue == null) {
			return limitValue;
		}

		if (userValue < limitValue) {
			Log.warn(`WARNING: updateInterval set to ${userValue}ms in the user config. This is lower than the allowable limit set by the ${this.name} API. WB-weather will use the API limit of ${limitValue}ms instead.`);
			return limitValue;
		}
		return userValue;
	}

/**
 * Convert a base url and query parameters into a full url with querystring.
 * @param {string} baseURL the URI of the API endpoint.
 * @param {object} queryParams key-value pairs in an object to be parameterized.
 * @returns {string} the full url with querystring.
 */
	getQueryStringURL(baseURL, queryParams) {
		let params = Object.entries(queryParams);
		if (params.length < 1) {
			return baseURL;
		}

		return baseURL + "?" +
			params.map(kv => kv.map(encodeURIComponent).join("="))
			.join("&");
	}
}
