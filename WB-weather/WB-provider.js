/* Magic Mirror - WallberryTheme <3
 * Module: WB-weather
 *
 * By JSC (@delightedCrow)
 * MIT Licensed.
 */

/**
* This is the base class representing a weather provider for WB-Weather.
* @class
* @param {Object} config - The config object passed to the WB-weather module
* @param {Object} delegate - The delegate that should be informed when the provider has a weather update. delegate must implement the function updateAvailable()
*/
class WBProvider {
	constructor(config, delegate) {
		this.config = config;
		this.name = config.providerName;
		this.delegate = delegate;
		this.daysToForecast = this.checkForecastLimit(config.daysToForecast, this.daysToForecastLimit);
		this.updateInterval = this.checkUpdateLimit(config.updateInterval, this.updateIntervalLimit);

		this.weatherObject = null;
		this.error = null;
	}

	/**
	* REQUIRED SUBCLASS FUNCTIONS
	* These MUST be implemented in your Provider subclass
	*/

	/**
	* in milliseconds, the limit on how often we should check
	* for weather updates
	* @type {Number}
	*/
	get updateIntervalLimit() {
		throw new Error(`Weather Provider ${this.name} does not subclass the updateIntervalLimit() getter method.`);
	}

	/**
	* The maximum number of days we can get forecast data for
	* @type {Number}
	*/
	get daysToForecastLimit() {
		throw new Error(`Weather Provider ${this.name} does not subclass the daysToForecastLimit() getter method.`);
	}

	/**
	* Implement your API call here.
	* It hould call the appropriate resolve function when your
	* call is complete.
	*/
	fetchWeather() {
		throw new Error(`Weather Provider ${this.name} does not subclass the fetchWeather() method.`);
	}

	/**
	* RESOLVE FUNCTIONS
	* A Subclass should call these from fetchWeather()
	*/

	/**
	* Call this with a populated WBWeather object when your
	* API fetch succeeded.
	* @param {WBWeather} weatherObject a weather object filled with weather data.
	*/
	resolveWithSuccess(weatherObject) {
		Log.info(`WB-weather: successfully got weather using ${this.name}`);
		this.weather = weatherObject;
		this.error = null;
		this.delegate.updateAvailable();
	}

	/**
	* call this if you encounter a critical error that needs user
	* intervention and the module should halt all future update
	* requests. Errors like this are: server responds with
	* authentication error, or the user's configuration options
	* have resulted in a bad request
	* @param {String} errorMessage the error message
	*/
	resolveWithCriticalError(errorMessage) {
		this.error = new WBError(false, errorMessage);
		Log.error(`WB-weather: CRITICAL error fetching weather with ${this.name}: ${errorMessage}.`);
		this.delegate.updateAvailable();
	}

	/**
	* call this if you encounter a temporary error and the module
	* should try a server request again after a delay
	* (such as, network is down, or the server is down but
	* should come back).
	* @param {String} errorMessage the error message
	*/
	resolveWithTemporaryError(errorMessage, retryDelay) {
		let delay = retryDelay ? retryDelay : this.errorRetryDelay;
		Log.warn(`WB-weather: error fetching weather with ${this.name}: ${errorMessage}. Retrying in ${delay/1000} seconds.`);
		this.error = new WBError(true, errorMessage, delay);
		this.delegate.updateAvailable();
	}

	/**
	* HELPER FUNCTIONS
	* These are Useful.
	*/

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

	/**
	* Return true if your class uses the node_helper, false if not
	* @type {Boolean}
	*/
	get usesNodeHelper() {
		return false;
	}

	/**
	* In milliseconds, how long to wait before trying a fetch again
	* after a temporary error.
	* @type {Number}
	*/
	get errorRetryDelay() {
		return this.updateIntervalLimit;
	}

	/**
	* Gets the stored WBWeather object.
	* @type {WBWeather}
	*/
	get weather() {
		return this.weatherObject;
	}

	/**
	* Sets the stored WBWeather object.
	* @param {WBWeather} weather the weather object to set
	*/
	set weather(weather) {
		this.weatherObject = weather;
	}

	/**
	* Checks to make sure the value supplied by the user in the config is within our API's Forecast limit
	* @param {Number} userValue the daysToForecast option supplied by the user
	* @param {Number} limitValue the maximum number of days we can forecast
	*/
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

	/**
	* Checks to make sure the value supplied by the user in the config is within our API's update limit
	* @param {Number} userValue the updateInterval option supplied by the user
	* @param {Number} limitValue the minimum time we should go between fetches
	*/
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
}

/**
* This subclass represents a weather provider for WB-Weather that needs the node_helper.js function of MagicMirror to make its API call.
* @class
* @param {Object} config - The config object passed to the WB-weather module
* @param {Object} delegate - The delegate that should be informed when the provider has a weather update. delegate must implement the function updateAvailable()
*/
class WBProviderWithHelper extends WBProvider {
	constructor(config, delegate) {
		super(config, delegate);
	}

	/**
	* automatically sets this to true... because duh.
	* @type {Boolean}
	*/
	get usesNodeHelper() {
		return true;
	}

	/**
	* REQUIRED SUBCLASS FUNCTIONS
	* These MUST be implemented in your ProviderWithHelper subclass
	*/

	/**
	* This should return an object filled with whatever data your helper function requires to do its fetch
	* @returns {Object} AnyObject
	*/
	dataForHelper() {
		throw new Error(`Weather Provider ${this.name} does not subclass the dataForHelper() method.`);
	}

	/**
	* This is where you should process the data returned by your helper function, just as you would in a fetchWeather() function.
	* @param {Object} data - The result from your helper function
	*/
	helperResponse(data) {
		throw new Error(`Weather Provider ${this.name} does not subclass the helperResponse() method.`);
	}
}


/**
* A utility class for WB-weather.js to manage its weather providers
*/
var WBProviderManager = {
	providers: {},
	register: function(providerName, providerClass) {
		this.providers[providerName] = providerClass;
	},

	initialize: function(config, delegate) {
		if (this.hasProvider(config.providerName)) {
			return new this.providers[config.providerName](config, delegate);
		}
		return null;
	},

	providerUsesHelper: function(providerName) {
		return this.providers[providerName].usesNodeHelper;
	},

	hasProvider: function(providerName) {
		if (this.providers.hasOwnProperty(providerName)) {
			return true;
		}
		return false
	}
};
