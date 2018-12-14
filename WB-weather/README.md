# Module: WB-weather
The `WB-weather` module was designed to complement the `WallberryTheme` module and displays the current weather and forecast.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: "WallberryTheme/WB-weather",
		position: "bottom_bar",  // Highly suggested location
		config: {
			// See "Configuration options" for more information.
			darkSkyApiKey: "Your DarkSky API key",
			latitude:   47.603230,
			longitude: -122.330276
		}
	}
]
````

## Configuration options

The following properties can be configured:


| Option                      | Type    | Description
| ----------------------------|---------| -----------
| `darkSkyApiKey`             | String  | Your DarkSky API key. Sign up for free at [https://darksky.net/dev](https://darksky.net/dev). Free accounts allow for 1,000 API calls per day. <br><br>  This value is **REQUIRED**
| `latitude`                  | Number  | Your current latitude. <br><br>  This value is **REQUIRED**
| `longitude`                 | Number  | Your current longitude. <br><br>  This value is **REQUIRED**
| `units`                     | String  | What temperature units to use. [Full units list available at DarkSky API docs (units parameter)](https://darksky.net/dev/docs#forecast-request). <br><br> **Possible values:** `"us"`(imperial units), `"si"` (metric units), `"auto"` (selects units based on geographic location) <br> **Default value:** `"auto"`
| `roundTemp`                 | Boolean | Round temperature value to nearest integer. <br><br> **Possible values:** `true` (round to integer) or `false` (display exact value with decimal point) <br> **Default value:** `true`
| `language`                  | String  | What language to use. [Full language list available at DarkSky API docs (language parameter)](https://darksky.net/dev/docs#forecast-request). <br><br> **Possible values:** `en`, `nl`, `ru`, etc...<br> **Default value:** uses value of _config.language_
| `daysToForecast`            | Number  | How many days to forecast in weekly forecast. <br><br> **Possible values:** `0` - `8` <br> **Default value:** `4`
| `updateInterval`            | Number  | How often to fetch new weather data. (Milliseconds) <br><br> **Default value:** `600000` (10 minutes)
