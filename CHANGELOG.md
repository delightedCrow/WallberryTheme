# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- Fixed [Issue 10](https://github.com/delightedCrow/WallberryTheme/issues/10): Background fades not reaching to bottom of screen for other 3rd party MM2 modules.

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
