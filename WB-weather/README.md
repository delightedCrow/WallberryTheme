# Module: WB-weather
The `WB-weather` module was designed to complement the `WallberryTheme` module and displays the current weather and forecast. It uses [OpenWeatherMap](https://openweathermap.org/) as its default weather provider, but it can be easily configured to use other weather providers instead.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
	{
		module: "WallberryTheme/WB-weather",
		position: "bottom_bar",  // Highly suggested location
		config: {
			// See "Configuration options" for more information.
			apiKey: "add your OpenWeatherMap API KEY here",
			latitude:   47.603230,
			longitude: -122.330276
		}
	}
]
````

## Available Weather Providers

### OpenWeatherMap

OpenWeatherMap is currently the default weather provider for WB-weather.

 * **Sign up for a free API key at [https://openweathermap.org/api](https://openweathermap.org/api)**.
 * Free accounts are limited to 60 API calls/minute.
 * **Note:** [OpenWeatherMap suggests a limit](https://openweathermap.org/appid) of 1 API call every 10 minutes (because their weather servers do not update weather any faster than that).

#### OpenWeatherMap Configuration Options

| Option                      | Default            | Type       | Description
| ----------------------------|--------------------| -----------|------------
| `apiKey` <br>**REQUIRED**   | None               |String      | The API key for your weather provider.
| `latitude` <br>**REQUIRED** | None               |Number      | Your current latitude.
| `longitude` <br>**REQUIRED**| None               |Number      | Your current longitude.
| providerName                | "openweathermap"   |String      | The name of your weather provider.
| template                    | "classic-wallberry"|String      | The name of your weather template. Supports `"classic-wallberry"`.
| `units`                     | config.units       |String      | What temperature units to use. **Possible values:** `"imperial"`, `"metric"`, `"standard"`<br>
| `language`                  | config.language    |String      | What language to use. <br><br> **Possible values:** `en`, `nl`, `ru`, etc...<br>
| `daysToForecast`            | 4                  |Number      | How many days to forecast in weekly forecast. <br><br> **Possible values:** `0` - `8` <br>
| `updateInterval`            | `600000` (10 minutes)|Number    | How often to fetch new weather data. (Milliseconds)

## Available Display Templates

### Classic Wallberry

The current default template for WB-weather. Displays the current weather and upcoming forecast.

* **Template Name:** `"classic-wallberry"`

Sample Screenshot: <img src="screenshots/wb-weather-wallberry-classic.jpg">

# WB-weather Development

**Pull Requests for adding new providers and templates are very welcome!**

**BEFORE** you submit your pull request:

- Please read [The Contributing Section of the WallberryTheme README](../README.md).
- **If you add a Template**: add a section for your template under the  `Available Display Templates` header in this README with the appropriate documentation (see the classic-wallberry template above for an example). **Make sure you include a sample screenshot of your template.**
- **If you add a Weather Provider**: add a section for your provider under the `Available Weather Providers` header in this README with appropriate documentation (see the openweathermap provider for above for an example).

### Creating A New Weather Provider

All weather providers should subclass the [`WBProvider` class](WB-provider.js) and are located in the `WB-weather/providers` directory.

#### Examples

See [WB-newProviderTemplate.js](WB-newProviderTemplate.js) as an example.

#### Naming Conventions

- Choose a short name for your provider, such as `myProvider`, that users will use in the `providerName` option in their module config file.
- Name your provider's javascript file `WB-{myProvider}.js`, with `{myProvider}` being your `providerName`.

### Creating A New Display Template

All templates are .njk files and should be located in the `WB-weather/templates` directory.

#### Examples

See the [classic-wallberry.njk](templates/classic-wallberry.njk) template as an example.

#### Data Sources

Templates can expect to have two named variables exposed to them by WB-weather:

- **`weather`** - this object's value will be `null` if there is no weather data, and will be a [`WBWeather` object](WB-dataObjects.js) populated with weather data by a weather provider.
- **`error`** - this object's value will be `null` if there were no errors while fetching the weather, or will be a [`WBError` object](WB-dataObjects.js) populated with error data if errors happened during fetch.

#### Naming Conventions

  * Choose a short, unique name for your template, such as `myTemplate`, that users will use in the `template` option in their module config file.
  * Use the same name for your template's .njk file, (e.g. `myTemplate.njk`).
  * If you have CSS to go along with your template, add a css file in `WB-weather/css` with the same name as your template (e.g. `myTemplate.css`).
