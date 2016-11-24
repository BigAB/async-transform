/*@bigab/async-transform@0.0.1#async-transform*/
define(['exports'], function (exports) {
    'use strict';
    Object.defineProperty(exports, '__esModule', { value: true });
    function asyncTransform(transforms, val, context) {
        if (typeof val === 'undefined') {
            return function (v) {
                return asyncTransform(transforms, v, context);
            };
        }
        var v = Promise.resolve(val);
        if (context) {
            transforms = transforms.map(function (t) {
                return function (v) {
                    return t.call(context, v);
                };
            });
        }
        return transforms.reduce(function (p, t) {
            return p.then(t);
        }, v);
    }
    exports.default = asyncTransform;
});