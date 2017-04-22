# * Intro
This is a fullstack todo List app with some Google APIs.

It uses the lightweight MVVM library 'Vue.js' and promise-based ajax library 'fetch' for client side app; and uses 'ExpressJs' and some Google APIs like 'Auth' and 'Calendar' for server side. 'gulp' has been used for the build tool to minify/uglify the source files into the '/dist' folder.


# * Setup
This app requires the Node.js environment, so plz install 'node' and 'npm' first. If you are using old version of Node.js that doesn't support Promise natively, please upgrade your Node.js, since the server of this app relies heavily on Promise.

It is also recommended to install 'yarn', which is much faster alternative to 'npm'.


## 1. Install dependencies
``` bash
$ npm/yarn install
```


## 2.1 Run the app & server
``` bash
$ npm/yarn start
```

## 2.2 Build app then run the built app & server
``` bash
$ npm/yarn run build
```

When running this command with no stored token, the Google Auth API will authorize the app by getting code from certain url. Please follow the guide info from the command line to fulfill the auth process.

After Auth process is done, the server will start, and the app will be automatically opened in the browser to use.