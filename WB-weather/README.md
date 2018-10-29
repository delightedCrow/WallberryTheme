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


| Option                       | Description
| ---------------------------- | -----------
| `darkSkyApiKey`              | Your DarkSky API key. Sign up for free at [https://darksky.net/dev](https://darksky.net/dev). Free accounts allow for 1,000 API calls per day. <br><br>  This value is **REQUIRED**
| `latitude`                   | Your current latitude. <br><br>  This value is **REQUIRED**
| `longitude`                  | Your current longitude. <br><br>  This value is **REQUIRED**
| `units`                      | What temperature units to use. Specified by config.js <br><br> **Possible values:** `config.units` = Specified by config.js, `default` = Kelvin, `si` = Celsius, `us` =Fahrenheit <br> **Default value:** `config.units`
| `roundTemp`                  | Round temperature value to nearest integer. <br><br> **Possible values:** `true` (round to integer) or `false` (display exact value with decimal point) <br> **Default value:** `true`
| `language`                   | What language to use. <br><br> **Possible values:** `en`, `nl`, `ru`, etc ... <br> **Default value:** uses value of _config.language_
| `daysToForecast`             | How many days to forecast in weekly forecast. <br><br> **Possible values:** `0` - `8` <br> **Default value:** `4`
| `updateInterval`             | How often to fetch new weather data. (Milliseconds) <br><br> **Default value:** `600000` (10 minutes)
