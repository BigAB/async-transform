# @bigab/async-transform

[![Build Status](https://travis-ci.org/BigAB/async-transform.png?branch=master)](https://travis-ci.org/BigAB/async-transform)

A tiny utility function for composing asynchronous transformations

**NOTE: Async/Await pretty much makes this module redundant. If you are either transpiling with Babel/Steal/...Whatever, or you are using an environment that supports Async/Await, you probably do not need this module**

  - great for unit testing
  - [composable](#composition)
  - <del>works great with ES2017's `async/await`</del>

**Async-Transform** is a simple function, that takes an array of **transform functions** and a **value** and runs each transform function in sequence, passing along the result of the last transform function and **returns a promise**.

There is also an option to create **async tranform functions** by using [partial application](#partial-application), which makes composition trivial. 

##### `asyncTransform(transformFunctions:array(Function)[, value:any, context:any]) -> Promise(any)`

**Transform Functions** are just functions that follow this pattern:

 - They accept 1 argument (the value)
 - they return either a value or a promise that resolves to a value
 - they **do not** return `undefined` as the value, and should guard against so

 That's it.
 
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


**Here is that example done better with async/await**
```javascript
const transformFunctions = [
  v => v+1,
  v => Promise.resolve(v*2),
  v => v*v,
  v => Promise.resolve({ value: v })
];

const process = value => transformFunctions
                           .reduce( async (v, tfunc) => tfunc(await v), value);

process(3)
  .then( v => console.log(v) ) // { value: 64 }
```

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

const thing = new Thing( 3 );
thing.calculate(4)
  .then( v => console.log(v) ) // { value: 21 }
  
```

**Here is that example done better with async/await**
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
  async calculate(v) {
    let val = await this.addValue(v);
    val = await this.multiplyValue(val);
    val = await this.wrap(val);
    return val;
  }
};

const thing = new Thing( 3 );
thing.calculate(4)
  .then( v => console.log(v) ) // { value: 21 }
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

**Here is that example done better with async/await**
```javascript
async buildDocumentationSite( filesGlob ) {
  
  const convertFilesToDocsJSON = async ( glob ) => {
    const files = await readFiles.call( this.plugins, glob );
    return parseFiles.call( this.plugins, files );
  };

  const docsToSiteData = async ( docs ) => {
    const pages = await createSiteStructure.call( this.plugins, docs );
    const orderedPages = await orderPages.call( this.plugins, pages );
    return orderMenu.call( this.plugins, orderedPages );
  };

  const generateDocsFromTemplates = async ( siteData ) => {
    await generateHTMLSite.call( this.templates, siteData );
    await generatePDF.call( this.templates, siteData );
    return generateMarkdownDocs.call( this.templates, siteData );
  }
  
  const docsJSON = await convertFilesToDocsJSON( filesGlob );
  const siteData = await docsToSiteData( docsJSON );
  return generateDocsFromTemplates( siteData );
}
```

<del>
Though ES2017's `async/await` feature may make hand-rolling your own async transformations super easy, `asyncTransform` still has a place due to it's context binding and dynamic composability, but it still works well **with** `async/await`.
</del>

There is nothing you couldn't do with async-transforms that async await doesn't already handle in a more standardized way: compare:

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

with 

```javascript
async function get( req ) {
  req = await checkBootstrapCache( req );
  let requestsToServer = await checkLocalStore( req )
  let res = await axios.get( requestsToServer );
  let parsedResponse = await parseResponse( res );
  let data = await extractData( parsedResponse );
  let model = instantiateModel( data );
  addToLocalStore( model );
  return model;
}
```

...yeah, async/await pretty much has it covered. Thanks for coming out though.

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

**Here is that example done better with async/await**

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

const awaitThenCall = async (hook, func) => func(await hook);

const beforeFindAllHooks = async hook => {
  return hooks.findAll.before.reduce( awaitThenCall, hook );
}

const afterFindAllHooks = async hook => {
  return hooks.findAll.after.reduce( awaitThenCall, hook );
}

export const findAll = async (query) => {
  const req = await beforeFindAllHooks(query);
  const res = await service.findAll( req );
  return afterFindAllHooks(res);
};

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
