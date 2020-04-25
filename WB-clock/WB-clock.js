/* Magic Mirror - WallberryTheme <3
 * Module: WB-clock
 *
 * By JSC (@delightedCrow)
 * MIT Licensed.
 */
Module.register("WB-clock",{
	// Module config defaults.
	defaults: {
		timeFormat: config.timeFormat,
		hourMinuteFormat: null,
		dateTimeFormat: "dddd, MMMM Do",
		localCityName: null,
		otherCities: []
	},

	updateTimer: null,
	// Define required scripts.
	getScripts: function() {
		return ["moment.js", "moment-timezone.js"];
	},
	// Define styles.
	getStyles: function() {
		return ["WB-clock.css"];
	},

	getTemplate: function() {
		return "WB-clock.njk";
	},

	getTemplateData: function() {

		var now = moment();
		var timeData = {};
		timeData.cities = [];

		timeData.localTime = now.format(this.config.hourMinuteFormat);
		timeData.date = now.format(this.config.dateTimeFormat);
		timeData.ampm = now.format("a");

		for (var cityElem in this.config.otherCities) {
			var city = {};
			city.name = this.config.otherCities[cityElem].name;
			let tz = this.config.otherCities[cityElem].timezone;
			city.time = now.tz(tz).format(this.config.hourMinuteFormat);
			city.ampm = now.tz(tz).format("a");
			timeData.cities.push(city);
		}

		return {
			config: this.config,
			timeData: timeData
		};
	},

	start: function() {
		Log.info("Starting module: " + this.name);

		// Update clock every second
		this.updateTimer = setInterval(() => {
			this.updateDom();
		}, 1000);

		// Set locale.
		moment.locale(config.language);

		// if the user hasn't set a custom time format
		if (!this.config.hourMinuteFormat) {

			// then we try and choose an appropriate format based on MM2 config
			if (this.config.timeFormat == 12) {
				this.config.hourMinuteFormat = "h:mm";
			} else {
				this.config.hourMinuteFormat = "HH:mm";
			}
		}
	},

	suspend: function() {
		Log.info("Suspending WB-clock...");
		clearInterval(this.updateTimer);
	},

	resume: function() {
		clearInterval(this.updateTimer);
		this.start();
	},

	nunjucksEnvironment: function() {
		if (this._nunjucksEnvironment !== null) {
			return this._nunjucksEnvironment;
		}

		var self = this;

		this._nunjucksEnvironment = new nunjucks.Environment(new nunjucks.WebLoader(this.file(""), {async: true, useCache: true}), {
			trimBlocks: true,
			lstripBlocks: true
		});

		return this._nunjucksEnvironment;
	}
});
