# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- Fixed [issue 36](https://github.com/delightedCrow/WallberryTheme/issues/36) where the openweathermap provider for WB-weather wasn't properly using the language setting.

## 3.1.0 - 2021-3-4
### Fixed
- Fixed [issue 35](https://github.com/delightedCrow/WallberryTheme/issues/35) of image not loading due to Unsplash API change.
- Fixed [issue 33](https://github.com/delightedCrow/WallberryTheme/issues/33) showing incorrect documentation for WallberryTheme config.

### Added
- Added the following config options to WallberryTheme for customizing images: `imageWidth`, `imageHeight`, and `imageOptions`.

### Removed
- Removed the `resizeForScreen` config option.

## 3.0.1 - 2021-1-15
### Fixed
- WB-weather: Fixed issue with blank forecast weather icons showing up when using DarkSky provider.
- Fixes [issue 29](https://github.com/delightedCrow/WallberryTheme/issues/29) of Wallberry not loading background images on start up due to a failure to clear the Electron Cache. WalberryTheme's node_helper.js has been updated to use the [Electron's newer promise API for session.clearCache()](https://github.com/electron/electron/pull/17185).
- WB-weather: fixes [issue 31](https://github.com/delightedCrow/WallberryTheme/issues/31); floating elements now get cleared properly, so WB-weather elements now stay together as a unified block.

## 3.0.0 - 2020-11-18
### Changed
- WB-weather now uses openweathermap as its default weather provider (as DarkSky has been acquired by Apple).
- Changed WalberryTheme, WB-weather, and WB-clock to all use cached web templates in their nunjucks environments instead of requesting a new version from the server every time.

### Fixed
- Memory leak described in [Issue 25](https://github.com/delightedCrow/WallberryTheme/issues/25) (authored by [@samusaran](https://github.com/samusaran)).
- General linting and code clean up.

### Added
- Wb-weather has been completely refactored and can now switch between multiple weather providers and display templates.

## 2.2.1 - 2019-10-30
### Fixed
- Requesting the proper font awesome stylesheet now - no more 404s on FA now :)

## 2.2.0 - 2019-3-08
### Added
- Contributing section to the README.md
- New feature to get a random Unsplash photo related to one or more keywords specified in the `queries` option (authored by [@samusaran](https://github.com/samusaran))

## 2.1.0 - 2019-2-21
### Fixed
- Fixed [Issue 10](https://github.com/delightedCrow/WallberryTheme/issues/10), where background fades did not reach to the edges of the screen for other 3rd party MM2 modules.
- Provided a more permanent fix for [Issue 8](https://github.com/delightedCrow/WallberryTheme/issues/8) by adding an option to clear Electron's cache on start up.
- WallberryTheme, WB-clock, and WB-weather all properly suspend their activity when hidden now, and resume properly when woken back up again.

## 2.0.0 - 2019-2-10
### Added
- the option `backgroundOpacity` in WallberryTheme to set the brightness of the background.
- the `autoDimOn` option in WallberryTheme, which automatically detects light images and darkens them to the value set in the `brightImageOpacity` option. This can help with readability, increasing contrast between the background image and the text an top of it.
- the `addBackgroundFade` option, which allows the user to turn on fading background gradients for the top and bottom regions of the magic mirror, increasing readability.
- both `autoDimOn` and `addBackgroundFade` use the color information sent by Unsplash to tint their backgrounds to the same general hue as the background image, causing them to blend better with most images.

### Changed
- WB-weather and WB-clock no longer have their own background gradients set in CSS (since the main WallberryTheme module handles this now).

## 1.1.0 - 2019-1-21
### Changed
- Updated all module READMEs to make the types of module options more explicit.

### Added
- This Changelog file :)
- WallberryTheme now displays error messages if something goes wrong when fetching the Unsplash background.

## 1.0.0 - 2018-11-7
### Added
- EVERYTHING (this was the initial WallberryTheme release)
