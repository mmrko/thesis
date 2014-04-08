/* main.js - main entry point from luminotrace */

'use strict';

var context = window.cordova ? 'webview' : 'browser';

function main() {
    window.alert('app luminotrace is ready!\n Current execution context: ' + context);
}

window.document.addEventListener(window.cordova ? 'deviceready' : 'DOMContentLoaded', main, false);
