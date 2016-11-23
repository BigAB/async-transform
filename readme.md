# async-transform

[![Build Status](https://travis-ci.org/BigAB/async-transform.png?branch=master)](https://travis-ci.org/BigAB/async-transform)

A function for easy asynchronous flow

## Usage

### ES6 use

With StealJS, you can import this module directly in a template that is autorendered:

```js
import plugin from 'async-transform';
```

### CommonJS use

Use `require` to load `async-transform` and everything else
needed to create a template that uses `async-transform`:

```js
var plugin = require("async-transform");
```

## AMD use

Configure the `can` and `jquery` paths and the `async-transform` package:

```html
<script src="require.js"></script>
<script>
	require.config({
	    paths: {
	        "jquery": "node_modules/jquery/dist/jquery",
	        "can": "node_modules/canjs/dist/amd/can"
	    },
	    packages: [{
		    	name: 'async-transform',
		    	location: 'node_modules/async-transform/dist/amd',
		    	main: 'lib/async-transform'
	    }]
	});
	require(["main-amd"], function(){});
</script>
```

### Standalone use

Load the `global` version of the plugin:

```html
<script src='./node_modules/async-transform/dist/global/async-transform.js'></script>
```

## Contributing

### Making a Build

To make a build of the distributables into `dist/` in the cloned repository run

```
npm install
node build
```

### Running the tests

Tests can run in the browser by opening a webserver and visiting the `test.html` page.
Automated tests that run the tests from the command line in Firefox can be run with

```
npm test
```
