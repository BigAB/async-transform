# @bigab/async-transform

[![Build Status](https://travis-ci.org/BigAB/async-transform.png?branch=master)](https://travis-ci.org/BigAB/async-transform)

A tiny utility function for composing asynchronous transformations

  - great for unit testing
  - [composable](#composition)
  - works great with ES2017's `async/await`

## Install

```
npm install --save @bigab/async-transform
```

### ES6

With [StealJS](http://stealjs.com/), you can import this module with ES6 imports:

```js
import asyncTransform from '@bigab/async-transform';
```

### CommonJS

```js
var asyncTransform = require("@bigab/async-transform").default;
```

### Standalone

Load the `global` version of the plugin:

```html
<script src='./node_modules/async-transform/dist/global/@bigab/async-transform.js'></script>
<script>
asyncTransform([transformFunctions], val); // added to window
</script>
```

## Use

Async-Transform is a simple utility function, that takes an array of **transform functions** and a **value** and runs each transform function in sequence, passing the result of the last transform function (or value at the start) as the sole argument. `asyncTransform` returns a promise, which makes chaining and composing transform functions trivial.

A **transform function** is just a function that takes a single argument as the value and returns either a new value, or a promise that will resolve to a new value.

#### Basic use

```javascript
// some are sync transforms, some are async
const transformFunctions = [
  v => v+1,
  v => Promise.resolve(v*2),
  v => v*v,
  v => Promise.resolve({foo:v})
];

asyncTransform(funcs, 1)
  .then( v => console.log(v) ); // { foo: 16 }
```

#### Partial application

You can also omit the `value` argument and `asyncTransform` will return a **transform function** that will return a promise:

```javascript
const transformFunctions = [
  v => v+1,
  v => Promise.resolve(v*2),
  v => v*v,
  v => Promise.resolve({ value: v })
];

const process = asyncTransform( transformFunctions );

process(3)
  .then( v => console.log(v) ) // { value: 64 }
```
Since the partial application option returns what is considered a **transform function**, you can then use that return value to compose more complicated async-transformations, built up from easily testable pieces.

#### Setting context

You can also add an optional 3rd argument, which is the *[context](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Operators/this)* the transformFunctions will be run with (using `Function.prototype.call`).

```javascript
class Thing {
  constructor(baseValue) {
    this.value = baseValue;
  }
  addValue(v) {
    return v + this.value;
  }
  multiplyValue(v) {
    return v * this.value;
  }
  wrap(v) {
    return { value: v };
  }
  calculate(v) {
    const transforms = [
      this.addValue,
      this.multiplyValue,
      this.wrap
    ];
    return asyncTransform(transforms, v, this);
  }
};

const process = asyncTransform( funcs );

process(3)
  .then( v => console.log(v) ) // { value: 64 }
```

If you want to use the partial application option while also setting a context, just make sure to pass `undefined` for your value.

```javascript
/*...*/
buildDocumentationSite( filesGlob ) {
  const convertFilesToDocsJSON = asyncTransform([
    readFiles,
    parseFiles
  ], undefined, this.plugins);

  const docsToSiteData = asyncTransform([
    createSiteStructure,
    orderPages,
    orderMenu
  ], undefined, this.plugins);

  const generateDocsFromTemplates = asyncTransform([
    generateHTMLSite,
    generatePDF,
    generateMarkdownDocs
  ], undefined, this.templates);

  return asyncTransform([
    convertFilesToDocsJSON,
    docsToSiteData,
    generateDocsFromTemplates
  ], filesGlob);
}
/*...*/
```

Though ES2017's `async/await` feature may make hand-rolling your own async transformations super easy, `asyncTransform` still has a place due to it's context binding and dynamic composability, but it still works well **with** `async/await`.

```javascript
async function get( req ) {
  const requestsToServer = await asyncTransform([
    checkBootstrapCache,
    checkLocalStore
  ], req);
  const res = await axios.get( requestsToServer );
  const model = await asyncTransform([
    parseResponse,
    extractData,
    instantiateModel
  ], res);
  addToLocalStore( model );
  return model;
}
```

#### Composition

Because the partial application option of `asyncTransform` returns a **transform function**, composition becomes trivial, and allows you to break down the problem into tiny, easily testable, bite-sized pieces and compose those pieces into a powerful asynchronous transformation function.

```javascript
const hooks = {
  /*...*/
  findAll: {
    before: [
      authenticate({ field: 'user' }),
      authorize,
      convertToQueryParams,
      transformFields({ 'id': '_id' })
    ],
    after: [
      payload => payload.data,
      transformFields({ '_id': 'id' })
    ]
  }
  /*...*/
}

const beforeFindAllHooks = asyncTransform(hooks.findAll.before);

const afterFindAllHooks = asyncTransform(hooks.findAll.after);

export const findAll = asyncTransform([
  beforeFindAllHooks,
  service.findAll,
  afterFindAllHooks
]);

/* use:
 findAll({ completed: true })
  .then( completedTasks => display( completedTasks ) )
  .catch( err => displayError( err.reason ) )
*/
```

The example above, describes a complex findAll operation broken down into easy to test functions that do one thing well: `authenticate`, `authorize`, `convertToQueryParams`, and `transformFields`. By abstracting that complexity away, you can easily understand what `findAll` does without having to understand each piece until the point you need to.

**Async-Transform** is not a lot of code, it probably doesn't need to be it's own package, you could just copy the source into your own project. It is really more of a pattern. By unifying an interface: `a function that takes on value and returns a new value or promise of a value` we allow for composition and easy testing, and it's surprising how many problems can be solved using this pattern.

---

Though **async-transform** is pretty powerful and flexible, it still can only return one asynchronous value; What if you wanted to return more than one value, over time? When you want to take it to the next level, checkout [RxJS](https://github.com/Reactive-Extensions/RxJS) and other [FRP](https://github.com/stoeffel/awesome-frp-js) libraries in JavaScript. Good luck, and good learning!

## Contributing
[Contributing](./CONTRIBUTING.md)

### Making a Build

To make a build of the distributables into `dist/` in the cloned repository run

```
npm run build
```

### Running the tests

Tests can run in the browser by opening a webserver in the root, or running `npm run develop` and visiting the `/src/test` page.
Automated tests that run the tests from the command line in Firefox can be run with

```
npm test
```
