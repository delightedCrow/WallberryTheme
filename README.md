
# WallberryTheme: A MagicMirror² Module
The `WallberryTheme` module re-themes [MagicMirror²](https://github.com/MichMich/MagicMirror) to look like a beautiful photo-box wall display. It adds a new font, styles, and periodically changing background image pulled from Unsplash.com.

The WallberryTheme also comes packaged with two companion modules for displaying the time (`WB-clock`) and weather (`WB-weather`).

 **REQUIRED API KEYS:**

- A (free) Unsplash API key is required and can be obtained from [Unsplash.com](https://unsplash.com/developers).
- For the weather module, a (free) DarkSky API key is required and can be obtained at [DarkSky.net](https://darksky.net/dev).

## Screenshots
<p align="center">
<img style="flat: left; width: 50%;" src="screenshots/wb-screen1.jpg">
<img style="float: left; width: 50%;" src="screenshots/wb-screen2.jpg">
</p>

## Using the module

To use this module and its companion modules:
1.  Copy the `WallberryTheme` folder to your `MagicMirror/modules` directory
2.  Add the modules to the modules array in the `config/config.js` file like in the following example:

````javascript
modules: [
	// Base WallberryTheme adds new font, styles, and a rotating background image pulled from Unsplash.com
	{
		module: "WallberryTheme",
		position: "fullscreen_below", // Required Position
		config: {
			unsplashAccessKey: "Your Unsplash API Key", // REQUIRED
			collections: "2589108"
		}
	},
	// WB-clock adds local time (Optional Module)
	{
		module: "WallberryTheme/WB-clock",
		position: "top_bar", // highly suggest using top_bar position
		config: {
			localCityName: "Seattle", // optional
			otherCities: [
				{name: "DC", timezone: "US/Eastern"}, // optional
				{name: "Anchorage", timezone: "US/Alaska"} //optional
			]
		}
	},
	// WB-weather adds weather via DarkSky API (Optional Module)
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

The following properties of `WallberryTheme` can be configured. For more information on how to configure the [WB-clock](WB-clock/README.md) and [WB-weather](WB-weather/README.md) modules see their individual README files.


| Option                      | Type    | Description
| ----------------------------|---------| ----------------
| `unsplashAccessKey`         | String  | Your Unsplash API access key. Sign up for free at [https://unsplash.com/developers](https://unsplash.com/developers). Demo accounts are allowed `50 API requests per hour`. <br><br>  This value is **REQUIRED**
| `collections`               | String  | A comma-separated list of Unsplash collection IDs that photos should be pulled from. Collection IDs can be found in the URL of the collection, shown in the highlighted part of this screenshot: <img src="screenshots/unsplash-collection-id.png">  <br><br> **Example:** `"1538150,162213"` <br> **Default value:** `""` (no collection, theme will use a random Unsplash photo)
| `updateInterval`            | Number  | How often the photo should change (Milliseconds). <br><br> **Default value:** `300000` (5 minutes)
| `orientation`               | String  | What screen orientation photos should be optimized for. <br><br> **Possible values:** `"portrait"`, `"landscape"`, or `"squarish"` <br> **Default value:** `"portrait"`
| `resizeForScreen`           | Boolean | Whether a photo should be resized to fit the screen. <br><br> **Possible values:** `true` (resize photo) or `false` (use photo at full dimensions) <br> **Default value:** `true`

## Changelog

Visit the [Changelog file](CHANGELOG.md) to see the latest changes to the project :)
