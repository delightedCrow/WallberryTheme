/* MagicMirror² - WallberryTheme <3
 * Module: WB-weather
 *
 * By JSC (@delightedCrow)
 * MIT Licensed.
 */

module.exports = function(config) {
	return fetch(config.url)
		.then(res => res.json())
		.catch(error => {
			return {network_error: error};
		});
};
