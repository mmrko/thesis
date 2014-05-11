# LuminoTrace

* install [cordova-cli](https://github.com/apache/cordova-cli): `npm install -g cordova`
* run `npm install` to install project dependencies
* optionally, if you wish to simulate the app on iOS install [ios-sim](https://github.com/phonegap/ios-sim).

Build the app by running `gulp`. To emulate the app using [Ripple](https://www.npmjs.org/package/ripple-emulator) run `gulp watch --open` (omit `--open` if you don't wish to open the browser). To emulate the app using the emulator of a given platform's SDK (ios / android / wp8) run `cordova emulate <platform>` replacing `<platform>` with the platform of your choice.

For platform specific issues refer to Apache Cordova project's [Gettings Started Guides](http://cordova.apache.org/docs/en/2.5.0/guide_getting-started_index.md.html#Getting%20Started%20Guides).
