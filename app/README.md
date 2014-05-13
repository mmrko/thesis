* install [cordova-cli](https://github.com/apache/cordova-cli): `npm install -g cordova`
* run `npm run init` to scaffold the project
* optionally, if you wish to simulate/deploy the app on iOS install [ios-sim](https://github.com/phonegap/ios-sim) and [ios-deploy](https://github.com/phonegap/ios-deploy).

# Commands

* `gulp`: builds the app for production
    * `--minify`: minify assets

* `gulp watch`: start up a local dev server and watch over assets
    * `--ripple`: emulate the app using [Ripple](https://www.npmjs.org/package/ripple-emulator)
    * `--open`: open the app in the browser window

To emulate the app using SDK emulator run `cordova emulate <platform>` replacing `<platform>` with the platform of your choice (ios / android / wp8).

For platform specific issues refer to Apache Cordova's [Gettings Started Guides](http://cordova.apache.org/docs/en/2.5.0/guide_getting-started_index.md.html#Getting%20Started%20Guides).
