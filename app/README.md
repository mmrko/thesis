# LuminoTrace

* install [cordova-cli](https://github.com/apache/cordova-cli): `npm install -g cordova`
* run `npm run init` to scaffold the project
* optionally, if you wish to simulate/deploy the app on iOS install [ios-sim](https://github.com/phonegap/ios-sim) and [ios-deploy](https://github.com/phonegap/ios-deploy).

To emulate the app using [Ripple](https://www.npmjs.org/package/ripple-emulator) run `gulp watch --ripple` (append `--open` if you wish to pop-up the browser window).

To emulate the app using the emulator of a given platform's SDK (ios / android / wp8) run `cordova emulate <platform>` replacing `<platform>` with the platform of your choice.

To build the app run `gulp` (append `--minify` to minify assets).

For platform specific issues refer to Apache Cordova's [Gettings Started Guides](http://cordova.apache.org/docs/en/2.5.0/guide_getting-started_index.md.html#Getting%20Started%20Guides).
