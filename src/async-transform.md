@page async-transform

# async-transform

@module {function} async-transform
@release 1.0
@package ../../package.json

@description A function for easy asynchronous transformation flow

@signature `asyncTransform(transformFunctions:array(Function)[, value:any, context:any])`

**Transform Functions** are just functions that follow this pattern:

 - They accept 1 argument (the value)
 - they return either a value or a promise that resolves to a value
 - they **do not** return `undefined` as the value, and should guard against so

 That's it.

`asyncTransform` takes an `Array` of **Transform Functions** as it's first and only required argument.
