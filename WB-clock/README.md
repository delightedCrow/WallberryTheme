# Module: WB-clock
The `WB-clock` module is a digital clock designed to complement the `WallberryTheme` module. It displays the local time and date, and can display the local time for as many other locales as you care to configure.

## Using the module

To use this module, add it to the modules array in the `config/config.js` file:
````javascript
modules: [
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
	}
]
````

## Configuration options

The following properties can be configured, all are optional:

| Option             | Type    | Description
| -------------------|---------| -----------
| `timeFormat`       | String  | Use 12 or 24 hour format. <br><br> **Possible values:** `12` or `24` <br> **Default value:** uses value of _config.timeFormat_
| `dateTimeFormat`   | String  | Configure the date format as you like. <br><br> **Possible values:** [Docs](http://momentjs.com/docs/#/displaying/format/) <br> **Default value:** `"dddd, MMMM Do"`
| `hourMinuteFormat` | String  | Configure clock format as you like. <br><br> **Possible values:** [Docs](http://momentjs.com/docs/#/displaying/format/) <br> **Default value:** `"h:mm"` for 12 hour format, `"HH:mm"` for 24 hour format
| `localCityName`    | String  | The name of your local city to displayed above the local clock. <br><br> **Default value:** `""` (None)
| `OtherCities`      | Array   | A list of other city names (or whatever labels you like) and their timezones (see module config example above). For more information on which timezones are available [check here](https://momentjs.com/timezone/docs/#/data-formats/packed-format/).
