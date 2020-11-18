/* Magic Mirror - WallberryTheme <3
 * Module: WB-weather
 *
 * By JSC (@delightedCrow)
 * MIT Licensed.
 */


/**
* A class representing current weather data.
* @class
*/
class WBWeather {
	constructor() {
		// TODO: Expand WBWeather's properties with some of the more common weather data info available

		/**
		* An array of WBForecast objects
		* @type {Array}
		*/
		this.forecast = null;
		/**
		* The current temperature
		* @type {Number}
		*/
		this.temp = null;
		/**
		* The name of the weather icon to be used for this weather
		* See https://erikflowers.github.io/weather-icons/
		* @type {String}
		*/
		this.wicon = null;
		/**
		* The long-form description of the current weather.
		* @type {String}
		*/
		this.longDescription = null;
	}
}

/**
* A class representing forecasted weather data.
* @class
*/
class WBForecast {
	constructor() {
		// TODO: Expand WBForecast's properties with some of the more common weather data info available

		/**
		* The of time the forecasted data (Unix, UTC)
		* @type {Number}
		*/
		this.date = null;
		/**
		* The name of the weather icon to be used for this weather
		* See https://erikflowers.github.io/weather-icons/
		* @type {String}
		*/
		this.wicon = null;
		/**
		* The percentage chance of precipitation (0 to 100)
		* @type {Number}
		*/
		this.precipChance = null;
		/**
		* Type of precipitation expected - either "snow" or "rain"
		* @type {String}
		*/
		this.precipType = null;
		/**
		* The forecasted low temperature
		* @type {Number}
		*/
		this.minTemp = null;
		/**
		* The forecasted high temperature
		* @type {Number}
		*/
		this.maxTemp = null;
	}
}

/**
* A class representing an error.
* @class
*/
class WBError {
	constructor(isTemporary, description, delay) {
		/**
		* If the error is temporary (true) or not (false)
		* @type {Boolean}
		*/
		this.isTemporary = isTemporary;
		/**
		* The error message text
		* @type {String}
		*/
		this.description = description;
		/**
		* The time delay before next fetch, in milliseconds
		* (only used for temporary errors)
		* @type {Number}
		*/
		this.retryDelay = delay;
	}
}
