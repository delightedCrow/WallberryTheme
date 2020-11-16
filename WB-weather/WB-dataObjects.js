/* Magic Mirror - WallberryTheme <3
 * Module: WB-weather
 *
 * By JSC (@delightedCrow)
 * MIT Licensed.
 */

 // TODO: Expand WBWeather's properties with some of the more common weather data info available
 // TODO: hella documentation of all these properties
class WBWeather {
	constructor() {
		this.forecast = null; // array of WBForecast objects
		this.temp = null;
		this.wicon = null; // https://erikflowers.github.io/weather-icons/
		this.longDescription = null;
	}
}

class WBForecast {
	constructor() {
		this.date = null;
		this.wicon = null;
		this.precipChance = null;
		this.precipType = null;
		this.minTemp = null;
		this.maxTemp = null;
	}
}

class WBError {
	constructor(isTemporary, description, delay) {
		this.isTemporary = isTemporary; // boolean
		this.description = description; //error message text
		this.retryDelay = delay // milliseconds
	}
}
